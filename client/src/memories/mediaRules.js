/* The rules for photos and videos, in one place (the create form, the edit screen and the post-create uploader all use it). */
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
export const ACCEPT = [...PHOTO_TYPES, ...VIDEO_TYPES].join(",");

export const kindOf = (file) => (PHOTO_TYPES.includes(file.type) ? "photo" : VIDEO_TYPES.includes(file.type) ? "video" : null);
export const mbOf = (bytes) => (bytes / 1048576).toFixed(bytes > 10485760 ? 0 : 1);

/**
 * Which of these files may be added? `have` is how many photos/videos are already there (or waiting). Returns the ones that fit
 * and a plain-language line for each one that doesn't.
 */
export function checkFiles(fileList, have, limits) {
  const cap = { photo: limits.photos, video: limits.videos };
  const mb = { photo: limits.photoMb, video: limits.videoMb };
  const counts = { photo: have.photo || 0, video: have.video || 0 };
  const accepted = [];
  const problems = [];
  for (const file of Array.from(fileList)) {
    const kind = kindOf(file);
    if (!kind) { problems.push(`"${file.name}" isn't a supported file. Use JPG, PNG or WebP photos, and MP4, WebM or MOV videos.`); continue; }
    if (file.size > mb[kind] * 1048576) { problems.push(`"${file.name}" is ${mbOf(file.size)} MB. The limit is ${mb[kind]} MB for a ${kind}.`); continue; }
    if (counts[kind] >= cap[kind]) { problems.push(`You can add up to ${cap[kind]} ${kind}${cap[kind] === 1 ? "" : "s"}. "${file.name}" was skipped.`); continue; }
    counts[kind] += 1;
    accepted.push({ file, kind });
  }
  return { accepted, problems };
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
