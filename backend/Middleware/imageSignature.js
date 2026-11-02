/*
  Verifies that an uploaded file (multer diskStorage) really is an image
  by checking its magic bytes, not the client-supplied mimetype.
  Run AFTER multer. Deletes the temp file on failure.
*/
import fs from "node:fs/promises";

const matches = (b) =>
  (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) || // JPEG
  (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) || // PNG
  (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38) || // GIF
  (b.toString("ascii", 0, 4) === "RIFF" &&
    b.toString("ascii", 8, 12) === "WEBP"); // WebP

export const requireRealImage = async (req, res, next) => {
  const file = req.file;
  if (!file) return next();

  let handle;
  try {
    handle = await fs.open(file.path, "r");
    const buf = Buffer.alloc(12);
    await handle.read(buf, 0, 12, 0);
    await handle.close();
    handle = null;

    if (matches(buf)) return next();
  } catch (error) {
    if (handle) await handle.close().catch(() => {});
  }

  await fs.unlink(file.path).catch(() => {});
  return res.status(400).json({
    success: false,
    message: "Only JPEG, PNG, GIF or WebP images are allowed.",
  });
};
