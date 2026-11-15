import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import ffmpegPath from "ffmpeg-static";
import sharp from "sharp";

import MemoryPage from "../../models/memory/MemoryPage.js";
import { downloadToFile, uploadBuffer, uploadFile } from "../storage/s3.js";
import { removeFiles } from "./storageCleanup.js";

/*
  FAST COPIES OF EVERY PHOTO AND VIDEO (the original is never changed or removed).

  Photos  -> WebP at 480 / 1080 / 2400 px wide (quality 86, no upscaling, colour-managed) + a tiny blur preview.
             The gallery grid loads the 480/1080 copies through srcset, the full-screen view the 2400 one: sharp on a phone,
             a fraction of the bytes of a 10 MB camera file.
  Videos  -> a poster frame, a 1080p-or-source MP4 (H.264 High, CRF 19, `faststart` so playback starts after the first
             few hundred KB instead of the whole file) and, when the source is bigger than 720p, a lighter 720p MP4 for slow connections.

  It runs after the upload is confirmed, one job at a time, so it never competes with requests for long. If the server restarts mid-job,
  startMediaProcessor() picks the unfinished ones up again. A file that cannot be processed keeps working: the viewer falls back to the original.
*/
const MAX_TRIES = 3;
const SHARP_OPTS = { failOn: "none", limitInputPixels: 400_000_000 };
const PHOTO_SIZES = [["thumbKey", 480, "thumb"], ["mediumKey", 1080, "medium"], ["largeKey", 2400, "large"]];

const queue = [];
let running = false;

export const enqueueMedia = (pageId, mediaId) => {
  const id = `${pageId}:${mediaId}`;
  if (queue.some((j) => j.id === id)) return;
  queue.push({ id, pageId: String(pageId), mediaId: String(mediaId) });
  pump();
};

const pump = async () => {
  if (running) return;
  running = true;
  try {
    while (queue.length) {
      const job = queue.shift();
      await runJob(job).catch((e) => console.error("[memory] media processing crashed:", e?.message || e));
    }
  } finally { running = false; }
};

const runJob = async ({ pageId, mediaId }) => {
  const page = await MemoryPage.findById(pageId).select("media").lean();
  const m = page?.media?.find((x) => String(x._id) === mediaId);
  if (!m || m.processing === "done" || (m.kind !== "photo" && m.kind !== "video")) return;
  const set = (fields) => MemoryPage.updateOne({ _id: pageId, "media._id": m._id }, { $set: Object.fromEntries(Object.entries(fields).map(([k, v]) => [`media.$.${k}`, v])) });
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "memmedia-"));
  const made = [];
  try {
    const src = path.join(dir, "original");
    await downloadToFile(m.key, src);
    const out = m.kind === "photo" ? await processPhoto(src, m.key, made) : await processVideo(src, dir, m, made);
    // the media may have been deleted while we worked: then the new files must go too
    const still = await MemoryPage.exists({ _id: pageId, "media._id": m._id });
    if (!still) { await removeFiles(made); return; }
    await set({ ...out, processing: "done" });
  } catch (e) {
    console.error(`[memory] could not process ${m.key}:`, String(e?.message || e).slice(0, 300));
    await removeFiles(made);
    await set({ processing: (m.processingTries || 0) + 1 >= MAX_TRIES ? "failed" : "pending", processingTries: (m.processingTries || 0) + 1 }).catch(() => {});
  } finally {
    fs.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
};

async function processPhoto(src, key, made) {
  const base = () => sharp(src, SHARP_OPTS).rotate(); // .rotate() applies the camera's orientation
  const out = {};
  const meta = await base().metadata();
  const rotated = (meta.orientation || 1) >= 5; // 5-8 are the sideways ones: width and height swap
  const w = rotated ? meta.height : meta.width;
  const h = rotated ? meta.width : meta.height;
  for (const [field, width, name] of PHOTO_SIZES) {
    // never upscale; a small photo just gets the same size in every slot (the cheapest copy is kept)
    const buf = await base().resize({ width, withoutEnlargement: true }).webp({ quality: 86, effort: 4 }).toBuffer();
    const k = `${key}.d/${name}.webp`;
    await uploadBuffer(k, buf, "image/webp");
    made.push(k);
    out[field] = k;
  }
  const tiny = await base().resize({ width: 20 }).blur(0.8).webp({ quality: 40 }).toBuffer();
  out.blur = `data:image/webp;base64,${tiny.toString("base64")}`;
  if (w && h) { out.width = w; out.height = h; }
  return out;
}

const run = (args, timeoutMs) =>
  new Promise((resolve, reject) => {
    const p = spawn(ffmpegPath, ["-hide_banner", "-nostdin", "-y", ...args], { stdio: ["ignore", "ignore", "pipe"] });
    let err = "";
    p.stderr.on("data", (d) => { err = (err + d).slice(-4000); });
    const t = setTimeout(() => p.kill("SIGKILL"), timeoutMs);
    p.on("error", (e) => { clearTimeout(t); reject(e); });
    p.on("close", (code) => { clearTimeout(t); code === 0 ? resolve(err) : reject(new Error(`ffmpeg exited ${code}: ${err.slice(-300)}`)); });
  });

/** the output height is the source's, capped; the cap applies to the SHORT side so portrait phone videos keep their detail */
const scaleTo = (cap) => `scale=w='if(lt(iw,ih),min(${cap},iw),-2)':h='if(lt(iw,ih),-2,min(${cap},ih))':flags=lanczos`;

/** What is in the file (ffmpeg prints it on stderr when given only an input). */
const probe = async (src) => {
  const info = await run(["-i", src], 30_000).catch((e) => String(e.message));
  const v = /Video: (\w+)[^\n]*?, (yuv420p)[^,\n]*,[^\n]*?(\d{2,5})x(\d{2,5})/.exec(info);
  const bitrate = Number((/bitrate: (\d+) kb\/s/.exec(info) || [])[1]) || 0;
  const a = /Audio: (\w+)/.exec(info);
  return v ? { codec: v[1], pix: v[2], width: Number(v[3]), height: Number(v[4]), kbps: bitrate, audio: a ? a[1] : null } : null;
};

async function processVideo(src, dir, m, made) {
  const out = {};
  const info = await probe(src);
  const short = info ? Math.min(info.width, info.height) : Math.min(m.width || 1080, m.height || 1080);
  /* -g 50: a keyframe every ~2 s, so playback starts and seeks quickly. veryfast is ~2.5x quicker than medium for almost the same quality at CRF 19-20. */
  const enc = (cap, crf, maxrate) => ["-vf", scaleTo(cap), "-c:v", "libx264", "-profile:v", "high", "-level:v", "4.1", "-preset", "veryfast", "-crf", String(crf), "-maxrate", maxrate, "-bufsize", `${parseInt(maxrate, 10) * 2}M`, "-g", "50", "-keyint_min", "50", "-sc_threshold", "0", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", "-map_metadata", "-1"];

  const hd = path.join(dir, "hd.mp4");
  // Already H.264 8-bit, 1080p or smaller and a sane bitrate: no re-encode at all. Just move the index to the front of the file
  // (`faststart`) so it plays at once. Same pixels as the original, so no quality is lost, and it takes about a second.
  const webReady = info && info.codec === "h264" && info.pix === "yuv420p" && short <= 1080 && info.kbps > 0 && info.kbps <= 12_000 && (!info.audio || info.audio === "aac"); // other audio (mp3, opus, pcm) is re-encoded to AAC: every browser and phone plays that
  if (webReady) await run(["-i", src, "-c", "copy", "-movflags", "+faststart", "-map_metadata", "-1", hd], 10 * 60_000).catch(() => run(["-i", src, ...enc(1080, 19, "8M"), hd], 25 * 60_000));
  else await run(["-i", src, ...enc(1080, 19, "8M"), hd], 25 * 60_000);
  const hdKey = `${m.key}.d/hd.mp4`;
  await uploadFile(hdKey, hd, "video/mp4");
  made.push(hdKey);
  out.hdKey = hdKey;

  const poster = path.join(dir, "poster.jpg");
  await run(["-ss", "0.5", "-i", hd, "-frames:v", "1", "-q:v", "3", poster], 60_000).catch(() => run(["-i", hd, "-frames:v", "1", "-q:v", "3", poster], 60_000));
  const posterKey = `${m.key}.d/poster.jpg`;
  await uploadFile(posterKey, poster, "image/jpeg");
  made.push(posterKey);
  out.posterKey = posterKey;

  // the lighter copy is for slow connections: worth it when the HD one is big (over ~4 Mbps) or taller than 720p
  if (short > 800 || (info?.kbps || 0) > 4000) {
    const sd = path.join(dir, "sd.mp4");
    await run(["-i", hd, ...enc(720, 24, "3M"), sd], 15 * 60_000);
    const sdKey = `${m.key}.d/sd.mp4`;
    await uploadFile(sdKey, sd, "video/mp4");
    made.push(sdKey);
    out.sdKey = sdKey;
  }
  return out;
}

/** On start-up: finish anything left half-done, and process files uploaded before this feature existed. */
export const startMediaProcessor = () => {
  const sweep = async () => {
    const pages = await MemoryPage.find({ media: { $elemMatch: { kind: { $in: ["photo", "video"] }, processing: { $in: [null, "none", "pending"] }, processingTries: { $lt: MAX_TRIES } } } }).select("media._id media.kind media.processing media.processingTries").limit(200).lean();
    for (const p of pages) for (const m of p.media) if (["photo", "video"].includes(m.kind) && [undefined, null, "none", "pending"].includes(m.processing) && (m.processingTries || 0) < MAX_TRIES) enqueueMedia(p._id, m._id);
  };
  const go = () => sweep().catch((e) => console.error("[memory] media sweep failed:", e.message));
  setTimeout(go, 30_000).unref?.();
  setInterval(go, 10 * 60_000).unref?.();
};
