import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import Book from "../../models/Book.js";
import BookStorageSettings from "../../models/BookStorageSettings.js";
import uploadToCloudinary, { deleteFile as deleteFromCloudinary } from "../../utils/cloudinary.js";
import {
  s3Config,
  uploadFile as uploadToS3,
  createDownloadUrl,
  getObjectBuffer,
  deleteObject as deleteS3Object,
} from "../storage/s3.js";

/*
  Book files (PDFs) live in Cloudinary or in a private S3 bucket.

  - A book has `files[]`; each file knows its own storage, so both can coexist
    while an admin transfers everything from one to the other.
  - Books created before this feature only have the legacy `pdfUrl`/`fileName`
    pair. getBookFiles() treats that as a single Cloudinary file, so nothing
    needs migrating up front.
  - `pdfUrl` is kept equal to the first file ("s3://<key>" for S3) so filters
    such as "has a PDF" keep working. Never hand it to a browser: resolve it.
*/

export const PROVIDERS = ["cloudinary", "s3"];

const MB = 1024 * 1024;
const S3_SCHEME = "s3://";

export class BookFileError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

/* ---------------- settings ---------------- */

const SETTINGS_TTL_MS = 10 * 1000;
let cache = { provider: "cloudinary", at: 0 };

export const isCloudinaryConfigured = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

export const providerStatus = () => {
  const s3 = s3Config();

  return {
    cloudinary: {
      configured: isCloudinaryConfigured(),
      missing: [
        "CLOUDINARY_CLOUD_NAME",
        "CLOUDINARY_API_KEY",
        "CLOUDINARY_API_SECRET",
      ].filter((name) => !process.env[name]),
    },
    s3: {
      configured: s3.configured,
      missing: s3.missing || [],
      bucket: s3.configured ? s3.bucket : "",
      region: s3.region || "",
    },
  };
};

export const getDefaultProvider = async () => {
  if (Date.now() - cache.at < SETTINGS_TTL_MS) return cache.provider;

  try {
    const doc = await BookStorageSettings.findOne({ key: "global" })
      .select("provider")
      .lean();

    cache = { provider: doc?.provider || "cloudinary", at: Date.now() };
  } catch (error) {
    console.error("[BOOK STORAGE] settings read failed:", error.message);
    cache = { ...cache, at: Date.now() };
  }

  return cache.provider;
};

export const setDefaultProvider = async (provider, adminId = null) => {
  if (!PROVIDERS.includes(provider)) {
    throw new BookFileError("Unknown storage provider.");
  }

  assertConfigured(provider);

  const doc = await BookStorageSettings.findOneAndUpdate(
    { key: "global" },
    { $set: { provider, updatedBy: adminId } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();

  cache = { provider: doc.provider, at: Date.now() };

  return doc;
};

export const assertConfigured = (provider) => {
  const status = providerStatus()[provider];

  if (!status) throw new BookFileError("Unknown storage provider.");

  if (!status.configured) {
    throw new BookFileError(
      `${provider === "s3" ? "AWS S3" : "Cloudinary"} is not configured on the server (missing: ${status.missing.join(", ")}).`,
      503
    );
  }
};

export const normalizeProvider = async (value) => {
  const requested = String(value || "").trim().toLowerCase();

  if (PROVIDERS.includes(requested)) return requested;

  return getDefaultProvider();
};

/* ---------------- reading a book's files ---------------- */

const fromLegacy = (book) => {
  const raw = String(book?.pdfUrl || "").trim();

  if (!raw) return [];

  if (raw.startsWith(S3_SCHEME)) {
    return [
      {
        id: "legacy",
        storage: "s3",
        url: "",
        key: raw.slice(S3_SCHEME.length),
        fileName: book.fileName || "",
        size: 0,
      },
    ];
  }

  return [
    {
      id: "legacy",
      storage: "cloudinary",
      url: raw,
      key: "",
      fileName: book.fileName || "",
      size: 0,
    },
  ];
};

/** Every file of a book, in order, whether it was stored the new or the legacy way. */
export const getBookFiles = (book) => {
  const files = Array.isArray(book?.files) ? book.files : [];

  if (!files.length) return fromLegacy(book);

  return files.map((file) => ({
    id: String(file._id),
    storage: file.storage || "cloudinary",
    url: file.url || "",
    key: file.key || "",
    publicId: file.publicId || "",
    cloudinaryType: file.cloudinaryType || "",
    fileName: file.fileName || "",
    size: file.size || 0,
  }));
};

export const hasBookFiles = (book) => getBookFiles(book).length > 0;

/** Keeps the legacy pdfUrl/fileName pair equal to the first file. Call before save(). */
export const syncLegacyFields = (book) => {
  // `files` is the source of truth here. Do NOT use getBookFiles(): with an
  // empty list it would fall back to the very pdfUrl being cleared.
  const [first] = Array.isArray(book.files) ? book.files : [];

  if (!first) {
    book.pdfUrl = "";
    return;
  }

  book.pdfUrl = first.storage === "s3" ? `${S3_SCHEME}${first.key}` : first.url;
};

/* ---------------- names ---------------- */

const cleanName = (value) =>
  String(value || "")
    .replace(/[^a-zA-Z0-9 _.-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/^\.+|\.+$/g, "")
    .substring(0, 90);

/*
  Download name for one file: its own name, else the book's name. With several
  files and no name of their own they are numbered ("title-2.pdf").
*/
export const fileDownloadName = (book, file, index = 0, total = 1) => {
  const own = String(file?.fileName || "").replace(/\.pdf$/i, "");
  const fallback = String(book?.fileName || book?.slug || book?.title || "Target-Trek-Ebook").replace(/\.pdf$/i, "");

  const base = cleanName(own || (total > 1 && index > 0 ? `${fallback}-${index + 1}` : fallback)) || "Target-Trek-Ebook";

  return `${base}.pdf`;
};

/* ---------------- urls ---------------- */

/** A URL the browser (or the mailer) can fetch right now. */
export const resolveFileUrl = async (file, { ttl = 3600, filename } = {}) => {
  if (!file) return "";

  if (file.storage === "s3") {
    const { url } = await createDownloadUrl(file.key, {
      ttl,
      filename: filename || undefined,
    });

    return url;
  }

  return file.url;
};

/** A stored `pdfUrl` string (legacy field) turned into a usable link. */
export const resolvePdfUrlString = async (pdfUrl, options) => {
  const raw = String(pdfUrl || "");

  if (!raw.startsWith(S3_SCHEME)) return raw;

  return resolveFileUrl(
    { storage: "s3", key: raw.slice(S3_SCHEME.length) },
    options
  );
};

const MAX_DOWNLOAD_BYTES = 500 * MB;
const DOWNLOAD_TIMEOUT_MS = 120 * 1000;

/** The file's bytes, from whichever storage holds it. */
export const downloadFileBuffer = async (file) => {
  if (file.storage === "s3") {
    return getObjectBuffer(file.key, MAX_DOWNLOAD_BYTES);
  }

  const response = await fetch(file.url, {
    signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`File download failed (HTTP ${response.status}).`);
  }

  return Buffer.from(await response.arrayBuffer());
};

/* ---------------- writing ---------------- */

const safeUnlink = (filePath) => {
  if (filePath) fs.promises.unlink(filePath).catch(() => {});
};

const s3KeyFor = (name) => {
  const base =
    path
      .parse(String(name || "book"))
      .name.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50) || "book";

  return [s3Config().keyPrefix, "books", `${crypto.randomUUID()}-${base}.pdf`]
    .filter(Boolean)
    .join("/");
};

/** Uploads a local file to `provider` and returns the entry to push onto book.files. */
export const storeLocalFile = async ({ filePath, originalName, size, provider }) => {
  assertConfigured(provider);

  if (provider === "s3") {
    const key = s3KeyFor(originalName);
    const bytes = await uploadToS3(key, filePath, "application/pdf");

    return { storage: "s3", url: "", key, fileName: originalName || "", size: bytes };
  }

  const result = await uploadToCloudinary(filePath);

  if (!result?.secure_url) {
    throw new Error("Cloudinary did not return a secure URL.");
  }

  return {
    storage: "cloudinary",
    url: result.secure_url,
    key: "",
    publicId: result.public_id || "",
    cloudinaryType: result.resource_type || "",
    fileName: originalName || "",
    size: size || result.bytes || 0,
  };
};

/** Uploads every multer file; removes the temp files either way. */
export const storeUploadedFiles = async (multerFiles, provider) => {
  const stored = [];

  try {
    for (const file of multerFiles) {
      stored.push(
        await storeLocalFile({
          filePath: file.path,
          originalName: file.originalname,
          size: file.size,
          provider,
        })
      );
    }
  } catch (error) {
    // Do not leave half a batch behind in S3.
    await Promise.all(stored.map((entry) => deleteStoredFile(entry).catch(() => {})));
    throw error;
  } finally {
    multerFiles.forEach((file) => safeUnlink(file.path));
  }

  return stored;
};

/*
  Cloudinary url -> { publicId, type }.
  https://res.cloudinary.com/<cloud>/<image|raw|video>/upload/[transforms/]v123/<folder/name>.<ext>
  Images/videos are addressed without the extension, raw files with it.
*/
export const parseCloudinaryUrl = (url) => {
  const match = String(url || "").match(
    /^https?:\/\/res\.cloudinary\.com\/[^/]+\/(image|raw|video)\/(?:upload|authenticated|private)\/(?:.*?\/)?(?:v\d+\/)(.+)$/
  );

  if (!match) return null;

  const [, type, rest] = match;
  const clean = decodeURIComponent(rest.split("?")[0]);

  return { type, publicId: type === "raw" ? clean : clean.replace(/\.[^./]+$/, "") };
};

/** Removes the file from wherever it is stored. Throws on a real failure. */
export const deleteStoredFile = async (entry) => {
  if (!entry) return;

  if (entry.storage === "s3") {
    if (entry.key) await deleteS3Object(entry.key);
    return;
  }

  let publicId = entry.publicId;
  let type = entry.cloudinaryType;

  if (!publicId) {
    const parsed = parseCloudinaryUrl(entry.url);

    if (!parsed) return;

    publicId = parsed.publicId;
    type = parsed.type;
  }

  await deleteFromCloudinary(publicId, type || "image");
};

/** A book's cover image (Cloudinary) removed too. Best effort. */
export const deleteCoverImage = async (url) => {
  const parsed = parseCloudinaryUrl(url);

  if (parsed) await deleteFromCloudinary(parsed.publicId, parsed.type);
};

/* ---------------- transfer between storages ---------------- */

const MAX_ERRORS = 20;
let transferRunning = false;

export const isTransferRunning = () => transferRunning;

const moveFile = async (file, to) => {
  const buffer = await downloadFileBuffer(file);
  const tempPath = path.join(os.tmpdir(), `book-transfer-${crypto.randomUUID()}.pdf`);

  await fs.promises.writeFile(tempPath, buffer);

  try {
    return await storeLocalFile({
      filePath: tempPath,
      originalName: file.fileName,
      size: buffer.length,
      provider: to,
    });
  } finally {
    safeUnlink(tempPath);
  }
};

/*
  Moves one file to `to`, repoints the book at the copy, then deletes the
  original from the old storage (only after the book is saved).
*/
const moveOneFile = async (bookId, file, to) => {
  const moved = await moveFile(file, to);

  const fresh = await Book.findById(bookId);

  if (!fresh) {
    await deleteStoredFile(moved).catch(() => {});
    throw new Error("Book was deleted during the transfer.");
  }

  if (!fresh.files?.length) {
    // Legacy book: turn the single legacy file into files[0].
    fresh.files = [moved];
  } else {
    const target = fresh.files.id(file.id);

    if (!target) {
      await deleteStoredFile(moved).catch(() => {});
      throw new Error("File was removed during the transfer.");
    }

    Object.assign(target, {
      storage: moved.storage,
      url: moved.url,
      key: moved.key,
      publicId: moved.publicId || "",
      cloudinaryType: moved.cloudinaryType || "",
      size: moved.size || target.size,
    });
  }

  syncLegacyFields(fresh);

  try {
    await fresh.save();
  } catch (error) {
    await deleteStoredFile(moved).catch(() => {});
    throw error;
  }

  await deleteStoredFile(file).catch((error) =>
    console.error("[BOOK STORAGE] could not delete the old copy:", error.message)
  );
};

/** Moves every file of ONE book to `to` and deletes the old copies. Returns how many moved. */
export const transferBook = async (bookId, to) => {
  if (!PROVIDERS.includes(to)) throw new BookFileError("Unknown storage provider.");

  assertConfigured(to);

  const book = await Book.findById(bookId).select("_id title files pdfUrl fileName").lean();

  if (!book) throw new BookFileError("Product not found.", 404);

  const todo = getBookFiles(book).filter((f) => f.storage !== to);

  for (const file of todo) {
    await moveOneFile(book._id, file, to);
  }

  return todo.length;
};

const countFiles = async (provider) => {
  const books = await Book.find({
    $or: [{ "files.0": { $exists: true } }, { pdfUrl: { $nin: [null, ""] } }],
  })
    .select("files pdfUrl fileName")
    .lean();

  return books.reduce(
    (sum, book) => sum + getBookFiles(book).filter((f) => f.storage === provider).length,
    0
  );
};

export const fileCounts = async () => ({
  cloudinary: await countFiles("cloudinary"),
  s3: await countFiles("s3"),
});

/*
  Copies every file that is not in `to` into `to`, repoints the book at the
  copy, and deletes the original from the old storage once the copy is saved. Progress is stored in the settings document.
  Safe to run again: files already in `to` are skipped.
*/
export const startTransfer = async (to, adminId = null) => {
  if (!PROVIDERS.includes(to)) throw new BookFileError("Unknown storage provider.");

  if (transferRunning) throw new BookFileError("A transfer is already running.", 409);

  assertConfigured(to);

  const from = PROVIDERS.find((p) => p !== to);

  const books = await Book.find({
    $or: [{ "files.0": { $exists: true } }, { pdfUrl: { $nin: [null, ""] } }],
  }).select("_id title files pdfUrl fileName");

  const jobs = [];

  for (const book of books) {
    for (const file of getBookFiles(book)) {
      if (file.storage !== to) jobs.push({ book, file });
    }
  }

  transferRunning = true;

  await BookStorageSettings.findOneAndUpdate(
    { key: "global" },
    {
      $set: {
        transfer: {
          status: jobs.length ? "running" : "done",
          from,
          to,
          total: jobs.length,
          done: 0,
          failed: 0,
          errors: [],
          startedAt: new Date(),
          finishedAt: jobs.length ? null : new Date(),
          startedBy: adminId,
        },
      },
    },
    { upsert: true, setDefaultsOnInsert: true }
  );

  if (!jobs.length) {
    transferRunning = false;
    return { total: 0 };
  }

  // Runs in the background: the admin page polls the progress.
  (async () => {
    let done = 0;
    let failed = 0;
    const errors = [];

    for (const { book, file } of jobs) {
      try {
        await moveOneFile(book._id, file, to);

        done += 1;
      } catch (error) {
        failed += 1;
        if (errors.length < MAX_ERRORS) {
          errors.push(`${book.title}${file.fileName ? ` / ${file.fileName}` : ""}: ${String(error.message || error).slice(0, 200)}`);
        }
        console.error("[BOOK STORAGE] transfer failed for", String(book._id), error.message);
      }

      await BookStorageSettings.updateOne(
        { key: "global" },
        { $set: { "transfer.done": done, "transfer.failed": failed, "transfer.errors": errors } }
      );
    }

    await BookStorageSettings.updateOne(
      { key: "global" },
      {
        $set: {
          "transfer.status": failed && !done ? "failed" : "done",
          "transfer.finishedAt": new Date(),
          "transfer.done": done,
          "transfer.failed": failed,
          "transfer.errors": errors,
        },
      }
    );
  })()
    .catch(async (error) => {
      console.error("[BOOK STORAGE] transfer crashed:", error);
      await BookStorageSettings.updateOne(
        { key: "global" },
        { $set: { "transfer.status": "failed", "transfer.finishedAt": new Date(), "transfer.errors": [String(error.message || error)] } }
      ).catch(() => {});
    })
    .finally(() => {
      transferRunning = false;
    });

  return { total: jobs.length };
};

/** A transfer interrupted by a restart must not show "running" forever. */
export const markStaleTransfer = async () => {
  await BookStorageSettings.updateOne(
    { key: "global", "transfer.status": "running" },
    { $set: { "transfer.status": "failed", "transfer.finishedAt": new Date(), "transfer.errors": ["Interrupted by a server restart. Run the transfer again; finished files are skipped."] } }
  );
};

export const getStorageSettings = async () => {
  const doc = await BookStorageSettings.findOne({ key: "global" }).lean();

  return {
    provider: doc?.provider || "cloudinary",
    transfer: doc?.transfer || { status: "idle" },
    updatedAt: doc?.updatedAt || null,
    updatedBy: doc?.updatedBy || null,
  };
};
