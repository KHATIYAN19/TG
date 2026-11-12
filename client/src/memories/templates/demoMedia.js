/*
  Demo media for the template previews and the test pages.
  Drop files in these folders and they show up automatically (sorted by file name):
    src/assest/memories_images/   photos of couples (jpg, jpeg, png, webp, avif)
    src/assest/memories_video/    videos (mp4, webm, mov)
  Folder empty = the pretty emoji placeholders are used instead, so nothing breaks.
*/
const pick = (mods) => Object.keys(mods).sort().map((k) => mods[k]);
const IMAGES = pick(import.meta.glob("../../assest/memories_images/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP}", { eager: true, query: "?url", import: "default" }));
const VIDEOS = pick(import.meta.glob("../../assest/memories_video/*.{mp4,webm,mov,MP4,WEBM,MOV}", { eager: true, query: "?url", import: "default" }));

/** photos with the real images attached, in order (the extra placeholders stay as they are) */
export const withImages = (photos = []) => photos.map((p, i) => (IMAGES[i % Math.max(IMAGES.length, 1)] ? { ...p, url: IMAGES[i % IMAGES.length] } : p));

/** the video with a real file attached (video `n`, wrapping round), or the placeholder / null when there is none */
export const withVideo = (video, n = 0) => (video && VIDEOS.length ? { ...video, url: VIDEOS[n % VIDEOS.length] } : video);
