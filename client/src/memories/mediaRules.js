import { measureMedia } from "./memApi";
import { secLabel } from "./pricing";

/* The rules for photos and videos, in one place (the create form, the edit screen and the post-create uploader all use it). */
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
export const AUDIO_TYPES = ["audio/webm", "audio/ogg", "audio/mp4", "audio/x-m4a", "audio/aac", "audio/mpeg", "audio/wav", "audio/x-wav"];
export const AUDIO_ACCEPT = [...AUDIO_TYPES, ".m4a", ".mp3", ".wav", ".aac", ".ogg", ".webm"].join(",");
export const AUDIO_MAX_SEC = 120; // the default; the real limit comes from the server (limits.audioSec) and grows with add-ons
/** "audio/webm;codecs=opus" -> "audio/webm" (what the server accepts) */
export const baseType = (t) => String(t || "").split(";")[0].trim().toLowerCase();
export const ACCEPT = [...PHOTO_TYPES, ...VIDEO_TYPES].join(",");

export const kindOf = (file) => (PHOTO_TYPES.includes(file.type) ? "photo" : VIDEO_TYPES.includes(file.type) ? "video" : AUDIO_TYPES.includes(baseType(file.type)) ? "audio" : null);
export const mbOf = (bytes) => (bytes / 1048576).toFixed(bytes > 10485760 ? 0 : 1);

/**
 * Which of these files may be added? `have` is how many photos/videos are already there (or waiting). Returns the ones that fit
 * and a plain-language line for each one that doesn't.
 */
export function checkFiles(fileList, have, limits) {
  const cap = { photo: limits.photos, video: limits.videos, audio: 1 };
  const mb = { photo: limits.photoMb, video: limits.videoMb, audio: limits.audioMb ?? 10 };
  const counts = { photo: have.photo || 0, video: have.video || 0, audio: have.audio || 0 };
  const accepted = [];
  const problems = [];
  for (const file of Array.from(fileList)) {
    const kind = kindOf(file);
    if (!kind) { problems.push(`"${file.name}" isn't a supported file. Use JPG, PNG or WebP photos, and MP4, WebM or MOV videos.`); continue; }
    if (file.size > mb[kind] * 1048576) { problems.push(`"${file.name}" is ${mbOf(file.size)} MB. The limit is ${mb[kind]} MB for a ${kind}.`); continue; }
    if (counts[kind] >= cap[kind]) { problems.push(`${kind === "audio" ? "A page can have one voice message." : `You can add up to ${cap[kind]} ${kind}${cap[kind] === 1 ? "" : "s"}.`} "${file.name}" was skipped.`); continue; }
    counts[kind] += 1;
    accepted.push({ file, kind });
  }
  return { accepted, problems };
}

/** Same as checkFiles, plus the length of each video (read in the browser): a video longer than the page allows is turned away with a clear line. */
export async function checkFilesAsync(fileList, have, limits) {
  const { accepted, problems } = checkFiles(fileList, have, limits);
  const durations = new Map();
  const keep = [];
  for (const a of accepted) {
    if (a.kind === "video" && limits.videoSec) {
      const m = await measureMedia(a.file, "video");
      if (m.durationSec) {
        durations.set(a.file, m.durationSec);
        if (m.durationSec > limits.videoSec + 1) { problems.push(`"${a.file.name}" is ${secLabel(Math.round(m.durationSec))} long. A video can be up to ${secLabel(limits.videoSec)}. "Longer videos" in Get more room allows more.`); continue; }
      }
    }
    keep.push(a);
  }
  return { accepted: keep, problems, durations };
}

/* A caption is a few words under a photo or video, like "Our first trip". Kept to 4 words so it fits on the picture. */
export const CAPTION_WORDS = 4;
export const CAPTION_CHARS = 40;
export const CAPTION_IDEAS = ["Our first trip", "That silly selfie", "Best day ever", "Coffee and gossip", "Sunset walk", "Just us two"];
/** While typing: at most 4 words (a space after the 4th word is not allowed) and 40 characters. */
export const tidyCaption = (text) => {
  const clean = String(text || "").replace(/\s+/g, " ").replace(/^ /, "");
  const words = clean.split(" ");
  return (words.length > CAPTION_WORDS ? words.slice(0, CAPTION_WORDS).join(" ") : clean).slice(0, CAPTION_CHARS);
};
