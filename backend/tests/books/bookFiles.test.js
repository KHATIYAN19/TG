import test from "node:test";
import assert from "node:assert/strict";

process.env.AMAZON_ACCESS_KEY_ID = "AKIDEXAMPLE";
process.env.AMAZON_SECRET_ACCESS_KEY = "secret";
process.env.S3_REGION = "ap-south-1";
process.env.S3_BUCKET_NAME = "test-bucket";

const files = await import("../../services/books/bookFiles.js");

test("a legacy book (only pdfUrl) is one cloudinary file", () => {
  const list = files.getBookFiles({ pdfUrl: "https://x/y.pdf", fileName: "My Book" });
  assert.equal(list.length, 1);
  assert.equal(list[0].storage, "cloudinary");
  assert.equal(files.fileDownloadName({ title: "t" }, list[0], 0, 1), "My-Book.pdf");
});

test("an s3:// pdfUrl is read back as an s3 file", () => {
  const [file] = files.getBookFiles({ pdfUrl: "s3://books/a.pdf" });
  assert.deepEqual([file.storage, file.key], ["s3", "books/a.pdf"]);
});

test("files[] wins over the legacy pdfUrl and keeps order", () => {
  const book = { pdfUrl: "https://old", files: [{ _id: "1", storage: "s3", key: "k1" }, { _id: "2", storage: "cloudinary", url: "u2" }] };
  assert.deepEqual(files.getBookFiles(book).map((f) => f.id), ["1", "2"]);
});

test("syncLegacyFields follows files[0] and clears when empty", () => {
  const book = { files: [{ storage: "s3", key: "k1" }], pdfUrl: "x" };
  files.syncLegacyFields(book);
  assert.equal(book.pdfUrl, "s3://k1");
  book.files = [];
  files.syncLegacyFields(book);
  assert.equal(book.pdfUrl, "");
});

test("download names: own name, else numbered, always .pdf", () => {
  const book = { title: "T", slug: "slug" };
  assert.equal(files.fileDownloadName(book, { fileName: "a b.pdf" }, 0, 2), "a-b.pdf");
  assert.equal(files.fileDownloadName(book, {}, 0, 2), "slug.pdf");
  assert.equal(files.fileDownloadName(book, {}, 1, 2), "slug-2.pdf");
});

test("parseCloudinaryUrl finds the public id for image and raw uploads", () => {
  assert.deepEqual(files.parseCloudinaryUrl("https://res.cloudinary.com/c/image/upload/v1/f/n.pdf"), { type: "image", publicId: "f/n" });
  assert.deepEqual(files.parseCloudinaryUrl("https://res.cloudinary.com/c/raw/upload/v2/f/n.pdf"), { type: "raw", publicId: "f/n.pdf" });
  assert.equal(files.parseCloudinaryUrl("https://example.com/n.pdf"), null);
});
