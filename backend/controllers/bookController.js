import Book from "../models/Book.js";
import uploadFile from "../utils/cloudinary.js";
import redis from "../utils/redis.js";
import { listLiveOffersWithBooks } from "../services/bundleOffers.js";
import { getCatalogBooks, getPackProducts } from "../services/membership/membershipService.js";
import mongoose from "mongoose";
import asyncHandler from "express-async-handler";

const RESOURCE_TYPES = [
  "pdf",
  "ebook",
  "course",
  "bundle",
  "template",
  "notes",
  "other",
];

const CACHE_TTL = 300;

const CACHE_KEYS = {
  allBooks: "books:public:all",

  redirectUrl: (url) =>
    `books:public:redirect:${encodeURIComponent(url)}`,
};

const INCLUDED_PUBLIC_FIELDS =
  "title slug subtitle resourceType coverPageUrl fileName";

const PUBLIC_PRODUCT_FIELDS = [
  "title",
  "slug",
  "subtitle",
  "description",
  "resourceType",
  "price",
  "mrp",
  "currency",
  "paymentUrl",
  "redirectUrl",
  "pageKey",
  "coverPageUrl",
  "tags",
  "topics",
  "category",
  "highlights",
  "badge",
  "isFeatured",
  "includedBooks",
  "matches",
  "membership",
].join(" ");

// =====================================================
// RESPONSE HELPERS
// =====================================================

const fail = (res, status, message) => {
  return res.status(status).json({
    success: false,
    error: {
      message,
    },
  });
};

const getAdminId = (req) => {
  return req.user?.userId?.toString() || null;
};

// =====================================================
// REDIS HELPERS
// =====================================================

// In-process cache in front of Redis: a hit costs ~0ms instead of a network
// round-trip to Upstash. Short TTL because other instances only learn about
// admin changes when it expires (this instance is cleared immediately).
const MEM_TTL_MS = 15_000;
const MEM_MAX = 200;
const mem = new Map();

const memGet = (key) => {
  const hit = mem.get(key);
  if (!hit) return null;
  if (hit.exp < Date.now()) { mem.delete(key); return null; }
  return hit.value;
};

const memSet = (key, value) => {
  if (mem.size >= MEM_MAX) mem.delete(mem.keys().next().value);
  mem.set(key, { value, exp: Date.now() + MEM_TTL_MS });
};

const safeRedisGet = async (key) => {
  const local = memGet(key);
  if (local) return local;
  try {
    const value = await redis.get(key);
    if (value) memSet(key, value);
    return value;
  } catch (error) {
    console.error("Redis GET error:", error);
    return null;
  }
};

const safeRedisSet = async (key, value, ttl = CACHE_TTL) => {
  memSet(key, value);
  try {
    await redis.set(key, value, { ex: ttl });
  } catch (error) {
    console.error("Redis SET error:", error);
  }
};

const safeRedisDelete = async (...keys) => {
  mem.clear();
  try {
    const validKeys = [
      ...new Set(keys.filter(Boolean)),
    ];

    if (validKeys.length > 0) {
      await redis.del(...validKeys);
    }
  } catch (error) {
    console.error("Redis DELETE error:", error);
  }
};

const clearBookCaches = async (...urls) => {
  const keys = [
    CACHE_KEYS.allBooks,
    ...urls
      .filter(Boolean)
      .map(CACHE_KEYS.redirectUrl),
  ];

  await safeRedisDelete(...keys);
};

// When a standalone book changes, invalidate any
// public combo response that includes that book.
const clearRelatedBundleCaches = async (bookId) => {
  if (!bookId) return;

  const bundles = await Book.find({
    resourceType: "bundle",
    includedBooks: bookId,
  })
    .select("redirectUrl")
    .lean();

  if (bundles.length === 0) return;

  await safeRedisDelete(
    CACHE_KEYS.allBooks,
    ...bundles.map((bundle) =>
      CACHE_KEYS.redirectUrl(bundle.redirectUrl)
    )
  );
};

// =====================================================
// ARRAY PARSER
// Supports arrays, JSON strings and CSV strings
// =====================================================

const parseArray = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    const normalized = value.trim();

    if (!normalized) return [];

    try {
      const parsed = JSON.parse(normalized);

      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => String(item).trim())
          .filter(Boolean);
      }
    } catch {
      // Allow comma-separated values.
    }

    return normalized
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  throw new Error(
    "Expected an array, JSON array or comma-separated string."
  );
};

// =====================================================
// BOOLEAN PARSER
// =====================================================

const parseBoolean = (
  value,
  defaultValue = false
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return defaultValue;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (value === 1 || value === "1") {
    return true;
  }

  if (value === 0 || value === "0") {
    return false;
  }

  if (typeof value === "string") {
    const normalized = value
      .trim()
      .toLowerCase();

    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }

  return defaultValue;
};

// =====================================================
// VALIDATION HELPERS
// =====================================================

const isValidUrl = (value) => {
  try {
    const url = new URL(value);

    return (
      url.protocol === "http:" ||
      url.protocol === "https:"
    );
  } catch {
    return false;
  }
};

const validateSlug = (value) => {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
};

const validatePageKey = (value) => {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
};

const validateRedirectUrl = (value) => {
  if (
    !value ||
    typeof value !== "string"
  ) {
    return false;
  }

  const normalized = value.trim();

  return (
    normalized.startsWith("/") &&
    normalized.length > 1 &&
    !normalized.startsWith("//") &&
    !/[\r\n\\]/.test(normalized)
  );
};

// =====================================================
// CLOUDINARY UPLOAD
// =====================================================

const uploadProductFile = async (file) => {
  if (!file?.path) {
    throw new Error("Invalid uploaded file.");
  }

  const result = await uploadFile(file.path);

  if (!result?.secure_url) {
    throw new Error(
      "Cloudinary did not return a secure URL."
    );
  }

  return result;
};

// =====================================================
// NORMALIZE CREATE DATA
// =====================================================

const parseMatches = (value) => {
  if (value === undefined || value === null || value === "") return 0;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0 || n > 100) {
    throw new Error("Matches must be a whole number from 0 to 100.");
  }
  return n;
};

const PACK_PLANS = ["none", "all_current", "lifetime"];

const parsePackPlan = (value) => {
  const plan = String(value ?? "none").trim().toLowerCase();
  if (!PACK_PLANS.includes(plan)) {
    throw new Error("Pack type must be none, all_current or lifetime.");
  }
  return plan;
};

const normalizeCreateData = (body) => {
  return {
    title: String(body.title ?? "").trim(),

    slug: String(body.slug ?? "")
      .trim()
      .toLowerCase(),

    subtitle: String(body.subtitle ?? "").trim(),

    description: String(
      body.description ?? ""
    ).trim(),

    resourceType: String(
      body.resourceType ?? "pdf"
    )
      .trim()
      .toLowerCase(),

    price:
      body.price === undefined ||
      body.price === ""
        ? NaN
        : Number(body.price),

    mrp:
      body.mrp === undefined ||
      body.mrp === ""
        ? 0
        : Number(body.mrp),

    currency: String(body.currency ?? "INR")
      .trim()
      .toUpperCase(),

    paymentUrl: String(
      body.paymentUrl ?? ""
    ).trim(),

    redirectUrl: String(
      body.redirectUrl ?? ""
    ).trim(),

    pageKey: String(body.pageKey ?? "")
      .trim()
      .toLowerCase(),

    fileName: String(body.fileName ?? "").trim(),

    tags: parseArray(body.tags),

    topics: parseArray(body.topics),

    category: String(body.category ?? "").trim(),

    highlights: parseArray(body.highlights),

    badge: String(body.badge ?? "").trim(),

    isPublished: parseBoolean(
      body.isPublished,
      false
    ),

    isActive: parseBoolean(
      body.isActive,
      true
    ),

    isFeatured: parseBoolean(
      body.isFeatured,
      false
    ),

    sendEbookEmailOnPurchase: parseBoolean(
      body.sendEbookEmailOnPurchase,
      false
    ),

    // NEW: Included books for combo products
    includedBooks: parseArray(
      body.includedBooks
    ),

    // Prep Arena matches the buyer gets (0 = none) and the pack marker.
    matches: parseMatches(body.matches),

    membership: {
      plan: parsePackPlan(body.packPlan),
    },
  };
};

// =====================================================
// COMPLETE PRODUCT VALIDATION
// =====================================================

const validateCompleteProduct = (product) => {
  if (
    !product.title ||
    typeof product.title !== "string" ||
    product.title.trim().length < 3
  ) {
    return "Title must be at least 3 characters.";
  }

  if (
    !product.slug ||
    !validateSlug(product.slug)
  ) {
    return "Valid slug is required.";
  }

  if (
    !RESOURCE_TYPES.includes(product.resourceType)
  ) {
    return "Invalid resource type.";
  }

  const price = Number(product.price);
  const mrp = Number(product.mrp);

  if (
    !Number.isFinite(price) ||
    price < 0
  ) {
    return "Valid price is required.";
  }

  if (
    !Number.isFinite(mrp) ||
    mrp < 0
  ) {
    return "Valid MRP is required.";
  }

  if (
    mrp > 0 &&
    price > mrp
  ) {
    return "Price cannot be greater than MRP.";
  }

  if (
    !/^[A-Z]{3}$/.test(product.currency)
  ) {
    return "Currency must be a 3-letter code.";
  }

  if (
    !product.paymentUrl ||
    !isValidUrl(product.paymentUrl)
  ) {
    return "Valid payment URL is required.";
  }

  if (
    !validateRedirectUrl(product.redirectUrl)
  ) {
    return "Valid redirect URL is required.";
  }

  if (
    !validatePageKey(product.pageKey)
  ) {
    return "Valid pageKey is required.";
  }

  return null;
};

// =====================================================
// INCLUDED BOOKS VALIDATION
// =====================================================

// Supported:
// Single PDF -> includedBooks = []
// Single eBook -> includedBooks = []
// Bundle -> includedBooks = [bookId1, bookId2]
//
// Nested bundles are intentionally not supported.

const validateIncludedBooks = async ({
  resourceType,
  includedBooks = [],
  excludeId = null,
}) => {
  const ids = includedBooks.map(String);

  if (
    resourceType !== "bundle" &&
    ids.length > 0
  ) {
    return (
      "Only bundle products can have includedBooks."
    );
  }

  if (
    resourceType === "bundle" &&
    ids.length === 0
  ) {
    return "Bundle must contain at least one book.";
  }

  if (
    new Set(ids).size !== ids.length
  ) {
    return "Duplicate book IDs are not allowed.";
  }

  for (const id of ids) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return `Invalid included book ID: ${id}`;
    }
  }

  if (
    excludeId &&
    ids.includes(String(excludeId))
  ) {
    return "A bundle cannot include itself.";
  }

  if (ids.length === 0) {
    return null;
  }

  const books = await Book.find({
    _id: { $in: ids },
  })
    .select(
      "_id resourceType isActive isPublished pdfUrl"
    )
    .lean();

  if (books.length !== ids.length) {
    return "One or more included books do not exist.";
  }

  for (const book of books) {
    if (
      !["pdf", "ebook"].includes(book.resourceType)
    ) {
      return (
        "Bundle can only contain PDF or eBook products."
      );
    }

    if (!book.pdfUrl) {
      return (
        "Every included book must have an uploaded PDF."
      );
    }

    if (!book.isActive || !book.isPublished) {
      return (
        "All included books must be active and published."
      );
    }
  }

  return null;
};

// =====================================================
// DUPLICATE PRODUCT CHECK
// =====================================================

const findDuplicateProduct = async ({
  slug,
  pageKey,
  redirectUrl,
  excludeId = null,
}) => {
  const query = {
    $or: [
      { slug },
      { pageKey },
      { redirectUrl },
    ],
  };

  if (excludeId) {
    query._id = {
      $ne: excludeId,
    };
  }

  return Book.findOne(query)
    .select("_id slug pageKey redirectUrl")
    .lean();
};

const getDuplicateMessage = (
  duplicate,
  product
) => {
  if (duplicate.slug === product.slug) {
    return "Slug already exists.";
  }

  if (duplicate.pageKey === product.pageKey) {
    return "Page key already exists.";
  }

  if (
    duplicate.redirectUrl === product.redirectUrl
  ) {
    return "Redirect URL already exists.";
  }

  return "Product already exists.";
};

// =====================================================
// POPULATE INCLUDED BOOKS
// =====================================================

// Important: Public endpoints must not expose pdfUrl.
// Actual downloads require order/payment authorization.

const populateIncludedBooks = (query) => {
  return query.populate({
    path: "includedBooks",
    select: INCLUDED_PUBLIC_FIELDS,
  });
};

// =====================================================
// CREATE BOOK - POST
// =====================================================

// export const createBook = asyncHandler(
//   async (req, res) => {
//     const adminId = getAdminId(req);

//     if (!adminId) {
//       return fail(res, 401, "Unauthorized.");
//     }

//     let productData;

//     try {
//       productData = normalizeCreateData(req.body);
//     } catch (error) {
//       return fail(res, 400, error.message);
//     }

//     const validationError =
//       validateCompleteProduct(productData);

//     if (validationError) {
//       return fail(res, 400, validationError);
//     }

//     // Validate included books for combos
//     const includedError =
//       await validateIncludedBooks({
//         resourceType: productData.resourceType,
//         includedBooks: productData.includedBooks,
//       });

//     if (includedError) {
//       return fail(res, 400, includedError);
//     }

//     const duplicate =
//       await findDuplicateProduct(productData);

//     if (duplicate) {
//       return fail(
//         res,
//         409,
//         getDuplicateMessage(
//           duplicate,
//           productData
//         )
//       );
//     }

//     const coverFile =
//       req.files?.coverPage?.[0];

//     const pdfFile =
//       req.files?.pdf?.[0];

//     if (!coverFile) {
//       return fail(
//         res,
//         400,
//         "Cover page file is required."
//       );
//     }

//     // Individual books require their own PDF
//     if (
//       ["pdf", "ebook"].includes(
//         productData.resourceType
//       ) &&
//       !pdfFile
//     ) {
//       return fail(
//         res,
//         400,
//         "PDF file is required."
//       );
//     }

//     // Bundles reference existing PDFs.
//     if (
//       productData.resourceType === "bundle" &&
//       pdfFile
//     ) {
//       return fail(
//         res,
//         400,
//         "Do not upload a separate PDF for bundles."
//       );
//     }

//     let coverUpload;
//     let pdfUpload = null;

//     try {
//       coverUpload =
//         await uploadProductFile(coverFile);

//       if (pdfFile) {
//         pdfUpload =
//           await uploadProductFile(pdfFile);
//       }
//     } catch (error) {
//       console.error(
//         "Cloudinary Upload Error:",
//         error
//       );

//       return fail(
//         res,
//         500,
//         "Failed to upload product files."
//       );
//     }

//     const book = await Book.create({
//       ...productData,

//       coverPageUrl: coverUpload.secure_url,

//       pdfUrl:
//         pdfUpload?.secure_url || "",

//       fileName:
//         productData.fileName ||
//         pdfFile?.originalname ||
//         "",

//       createdBy: adminId,
//     });

//     await clearBookCaches(book.redirectUrl);

//     const result =
//       await populateIncludedBooks(
//         Book.findById(book._id)
//       );

//     return res.status(201).json({
//       success: true,
//       message: "Product created successfully.",
//       data: result,
//     });
//   }
// );

// // =====================================================
// // GET ALL PUBLIC BOOKS
// // =====================================================

// export const getAllBooks = asyncHandler(
//   async (req, res) => {
//     const cachedBooks =
//       await safeRedisGet(
//         CACHE_KEYS.allBooks
//       );

//     if (Array.isArray(cachedBooks)) {
//       return res.status(200).json({
//         success: true,
//         count: cachedBooks.length,
//         data: cachedBooks,
//       });
//     }

//     const books =
//       await populateIncludedBooks(
//         Book.find({
//           isActive: true,
//           isPublished: true,
//         })
//           .select(
//             [
//               "title",
//               "slug",
//               "subtitle",
//               "resourceType",
//               "price",
//               "mrp",
//               "currency",
//               "tags",
//               "redirectUrl",
//               "pageKey",
//               "coverPageUrl",
//               "category",
//               "badge",
//               "isFeatured",
//               "includedBooks",
//             ].join(" ")
//           )
//           .sort({
//             isFeatured: -1,
//             createdAt: -1,
//           })
//       ).lean();

//     await safeRedisSet(
//       CACHE_KEYS.allBooks,
//       books
//     );

//     return res.status(200).json({
//       success: true,
//       count: books.length,
//       data: books,
//     });
//   }
// );

export const createBook = asyncHandler(
  async (req, res) => {
    const adminId = getAdminId(req);

    if (!adminId) {
      return fail(res, 401, "Unauthorized.");
    }

    let productData;

    try {
      productData = normalizeCreateData(req.body);
    } catch (error) {
      return fail(res, 400, error.message);
    }

    const validationError =
      validateCompleteProduct(productData);

    if (validationError) {
      return fail(res, 400, validationError);
    }

    const includedError =
      await validateIncludedBooks({
        resourceType: productData.resourceType,
        includedBooks: productData.includedBooks,
      });

    if (includedError) {
      return fail(res, 400, includedError);
    }

    const duplicate =
      await findDuplicateProduct(productData);

    if (duplicate) {
      return fail(
        res,
        409,
        getDuplicateMessage(duplicate, productData)
      );
    }

    const coverFile =
      req.files?.coverPage?.[0];

    const pdfFile =
      req.files?.pdf?.[0];

    if (!coverFile) {
      return fail(
        res,
        400,
        "Cover page file is required."
      );
    }

    if (
      ["pdf", "ebook"].includes(productData.resourceType) &&
      !pdfFile
    ) {
      return fail(
        res,
        400,
        "PDF file is required."
      );
    }

    if (
      productData.resourceType === "bundle" &&
      pdfFile
    ) {
      return fail(
        res,
        400,
        "Do not upload a separate PDF for bundles."
      );
    }

    let coverUpload;
    let pdfUpload = null;

    try {
      coverUpload =
        await uploadProductFile(coverFile);

      if (pdfFile) {
        pdfUpload =
          await uploadProductFile(pdfFile);
      }
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);

      return fail(
        res,
        500,
        "Failed to upload product files."
      );
    }

    const book = await Book.create({
      ...productData,

      showInMainBooks: parseBoolean(
        req.body.showInMainBooks,
        false
      ),

      coverPageUrl: coverUpload.secure_url,

      pdfUrl:
        pdfUpload?.secure_url || "",

      fileName:
        productData.fileName ||
        pdfFile?.originalname ||
        "",

      createdBy: adminId,
    });

    await clearBookCaches(book.redirectUrl);

    const result =
      await populateIncludedBooks(
        Book.findById(book._id)
      );

    return res.status(201).json({
      success: true,
      message: "Product created successfully.",
      data: result,
    });
  }
);

// =====================================================
// POSITION HELPERS
// =====================================================

const DEFAULT_POSITION = 999999;

// Books created before `position` existed have no value, and Mongo sorts
// missing fields first. Give them the default so they sort last.
const backfillPositions = async () => {
  await Book.updateMany(
    { position: { $exists: false } },
    { $set: { position: DEFAULT_POSITION } }
  );
};

// Moves one book to `position` (1-based) and renumbers every book 1..n,
// so positions stay unique and gap-free.
export const updateBookPosition = asyncHandler(
  async (req, res) => {
    const { bookId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return fail(res, 400, "Invalid product ID.");
    }

    const requested = Number(req.body?.position);

    if (
      !Number.isInteger(requested) ||
      requested < 1
    ) {
      return fail(
        res,
        400,
        "Position must be a whole number of 1 or more."
      );
    }

    await backfillPositions();

    const books = await Book.find({})
      .select("_id redirectUrl")
      .sort({ position: 1, createdAt: -1 })
      .lean();

    const currentIndex = books.findIndex(
      (book) => String(book._id) === bookId
    );

    if (currentIndex === -1) {
      return fail(res, 404, "Product not found.");
    }

    const [moved] = books.splice(currentIndex, 1);
    const targetIndex = Math.min(
      requested - 1,
      books.length
    );
    books.splice(targetIndex, 0, moved);

    await Book.bulkWrite(
      books.map((book, index) => ({
        updateOne: {
          filter: { _id: book._id },
          update: { $set: { position: index + 1 } },
        },
      }))
    );

    await clearBookCaches(
      ...books.map((book) => book.redirectUrl)
    );

    return res.status(200).json({
      success: true,
      message: "Book position updated.",
      data: {
        bookId,
        position: targetIndex + 1,
        total: books.length,
      },
    });
  }
);


// =====================================================
// SINGLE-FLIGHT: while a cache fill is running, every other request for the
// same thing awaits that same promise. 500 simultaneous misses = 1 query.
// =====================================================

const flights = new Map();

const singleFlight = (key, fn) => {
  if (flights.has(key)) return flights.get(key);
  const promise = Promise.resolve()
    .then(fn)
    .finally(() => flights.delete(key));
  flights.set(key, promise);
  return promise;
};

// Product fills are tracked per URL, so overlapping batches (/hld+/lld+/combo
// and /lld+/hld+/combo) still share work, and what is not already being
// fetched goes out as ONE `$in` query.
const productFills = new Map();

const fillProducts = (urls) => {
  const need = urls.filter((u) => !productFills.has(u));

  if (need.length) {
    const query = (async () => {
      const found = await populateIncludedBooks(
        Book.find({
          redirectUrl: { $in: need },
          isActive: true,
          isPublished: true,
        }).select(PUBLIC_PRODUCT_FIELDS)
      ).lean();

      await Promise.all(
        found.map((product) =>
          safeRedisSet(CACHE_KEYS.redirectUrl(product.redirectUrl), product)
        )
      );

      return new Map(found.map((product) => [product.redirectUrl, product]));
    })();

    need.forEach((url) => {
      const fill = query.then((byUrl) => byUrl.get(url) || null);
      productFills.set(url, fill);
      fill.then(
        () => productFills.delete(url),
        () => productFills.delete(url)
      );
    });
  }

  return Promise.all(urls.map((u) => productFills.get(u)));
};

// cache first (memory, then Redis), then a coalesced fill
const loadProducts = async (urls) => {
  const out = {};
  const missing = [];

  await Promise.all(
    urls.map(async (url) => {
      const cached = await safeRedisGet(CACHE_KEYS.redirectUrl(url));
      if (cached) out[url] = cached;
      else missing.push(url);
    })
  );

  if (missing.length) {
    const filled = await fillProducts(missing);
    missing.forEach((url, i) => { out[url] = filled[i] || null; });
  }

  return out;
};

// =====================================================
// BUFFERED VIEW COUNTS: count in memory, write one $inc per book every
// VIEW_FLUSH_MS instead of one write per page load.
// =====================================================

const VIEW_FLUSH_MS = 20_000;
const VIEW_BUFFER_MAX = 2000;
const viewBuffer = new Map();

const countView = (id) => {
  const key = String(id);
  if (!viewBuffer.has(key) && viewBuffer.size >= VIEW_BUFFER_MAX) return;
  viewBuffer.set(key, (viewBuffer.get(key) || 0) + 1);
};

export const flushBookViews = async () => {
  if (!viewBuffer.size) return;

  const batch = [...viewBuffer];
  viewBuffer.clear();

  try {
    await Book.bulkWrite(
      batch.map(([id, n]) => ({
        updateOne: { filter: { _id: id }, update: { $inc: { "stats.views": n } } },
      })),
      { ordered: false }
    );
  } catch (error) {
    console.error("View flush error:", error);
    // put the counts back so they are retried on the next flush
    batch.forEach(([id, n]) => {
      if (viewBuffer.has(id) || viewBuffer.size < VIEW_BUFFER_MAX) {
        viewBuffer.set(id, (viewBuffer.get(id) || 0) + n);
      }
    });
  }
};

setInterval(flushBookViews, VIEW_FLUSH_MS).unref?.();

const loadAllBooks = async () => {
  const local = memGet(CACHE_KEYS.allBooks);
  if (Array.isArray(local)) return local;
  return singleFlight(CACHE_KEYS.allBooks, fillAllBooks);
};

const fillAllBooks = async () => {
  const cachedBooks = await safeRedisGet(CACHE_KEYS.allBooks);
  if (Array.isArray(cachedBooks)) return cachedBooks;

  await backfillPositions();

  const books = await populateIncludedBooks(
    Book.find({
      isActive: true,
      isPublished: true,
      showInMainBooks: { $ne: false },
    })
      .select(
        [
          "title", "slug", "subtitle", "resourceType", "price", "mrp", "currency",
          "tags", "redirectUrl", "pageKey", "coverPageUrl", "category", "badge",
          "isFeatured", "position", "includedBooks", "showInMainBooks", "matches", "membership",
        ].join(" ")
      )
      .sort({ position: 1, isFeatured: -1, createdAt: -1 })
  ).lean();

  await safeRedisSet(CACHE_KEYS.allBooks, books);
  return books;
};

const PUBLIC_CACHE = "public, max-age=30, stale-while-revalidate=120";

export const getAllBooks = asyncHandler(async (req, res) => {
  const books = await loadAllBooks();
  res.set("Cache-Control", PUBLIC_CACHE);
  return res.status(200).json({ success: true, count: books.length, data: books });
});

// =====================================================
// GET CATALOG: the books list AND the running bundle offers in ONE request
// (the /books page used to make three: list, offers, packs)
// =====================================================

// Same shape as GET /api/membership/plans -> data (packs, books, stats)
const loadPlans = async () => {
  const hit = memGet("books:public:plans");
  if (hit) return hit;
  return singleFlight("books:public:plans", fillPlans);
};

const fillPlans = async () => {
  const [packs, books] = await Promise.all([getPackProducts(), getCatalogBooks()]);
  const data = {
    packs,
    books,
    stats: {
      bookCount: books.length,
      individualWorth: books.reduce((n, b) => n + (Number(b.price) || 0), 0),
    },
  };
  memSet("books:public:plans", data);
  return data;
};

export const getCatalog = asyncHandler(async (req, res) => {
  const [books, offers, plans] = await Promise.all([
    loadAllBooks(),
    listLiveOffersWithBooks().catch((error) => {
      console.error("Catalog offers error:", error);
      return [];
    }),
    loadPlans().catch((error) => {
      console.error("Catalog plans error:", error);
      return null;
    }),
  ]);
  res.set("Cache-Control", PUBLIC_CACHE);
  return res.status(200).json({
    success: true,
    count: books.length,
    data: books,
    offers: offers.filter((o) => o.available),
    plans,
  });
});

// =====================================================
// GET PRODUCT BY REDIRECT URL
// =====================================================

export const getProductByRedirectUrl =
  asyncHandler(async (req, res) => {
    let { redirectUrl } = req.query;

    if (
      typeof redirectUrl !== "string" ||
      !redirectUrl.trim()
    ) {
      return fail(
        res,
        400,
        "Redirect URL is required."
      );
    }

    // Express already decodes query parameters.
    // Avoid double decoding valid URLs.
    redirectUrl = redirectUrl.trim();

    if (!validateRedirectUrl(redirectUrl)) {
      return fail(
        res,
        400,
        "Invalid redirect URL."
      );
    }

    const product = (await loadProducts([redirectUrl]))[redirectUrl];

    if (!product) {
      return fail(
        res,
        404,
        "Product not found."
      );
    }

    countView(product._id);

    res.set("Cache-Control", PUBLIC_CACHE);
    return res.status(200).json({
      success: true,
      data: product,
    });
  });

// =====================================================
// GET SEVERAL PRODUCTS BY REDIRECT URL (one round-trip)
// ?redirectUrls=/a,/b,/c  ->  { data: { "/a": product|null, ... } }
// Views are counted for the first URL only (the page being viewed).
// =====================================================

export const getProductsByRedirectUrls =
  asyncHandler(async (req, res) => {
    const raw = String(req.query.redirectUrls ?? "");
    const urls = [
      ...new Set(raw.split(",").map((u) => u.trim()).filter(Boolean)),
    ].slice(0, 10);

    if (!urls.length || !urls.every(validateRedirectUrl)) {
      return fail(res, 400, "Valid redirect URLs are required.");
    }

    const data = await loadProducts(urls);

    const primary = data[urls[0]];
    if (primary?._id) countView(primary._id);

    const out = {};
    urls.forEach((u) => { out[u] = data[u] || null; });

    res.set("Cache-Control", PUBLIC_CACHE);
    return res.status(200).json({ success: true, data: out });
  });

// =====================================================
// GET BOOK BY ID - ADMIN
// =====================================================

export const getBookByIdForAdmin =
  asyncHandler(async (req, res) => {
    const { bookId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(bookId)
    ) {
      return fail(
        res,
        400,
        "Invalid product ID."
      );
    }

    const book =
      await populateIncludedBooks(
        Book.findById(bookId)
      );

    if (!book) {
      return fail(
        res,
        404,
        "Product not found."
      );
    }

    return res.status(200).json({
      success: true,
      data: book,
    });
  });

// =====================================================
// GET ALL BOOKS - ADMIN
// =====================================================

export const getAllBooksForAdmin =
  asyncHandler(async (req, res) => {
    await backfillPositions();

    const {
      page = 1,
      limit = 20,
      search = "",
      isPublished,
      isActive,
      resourceType,
    } = req.query;

    const pageNumber = Math.max(
      Number.parseInt(page, 10) || 1,
      1
    );

    const limitNumber = Math.min(
      Math.max(
        Number.parseInt(limit, 10) || 20,
        1
      ),
      100
    );

    const query = {};

    if (
      typeof search === "string" &&
      search.trim()
    ) {
      const escapedSearch = search
        .trim()
        .replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        );

      query.$or = [
        {
          title: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
        {
          slug: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
        {
          pageKey: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
      ];
    }

    if (isPublished !== undefined) {
      query.isPublished = parseBoolean(
        isPublished,
        false
      );
    }

    if (isActive !== undefined) {
      query.isActive = parseBoolean(
        isActive,
        false
      );
    }

    if (resourceType !== undefined) {
      const normalizedType = String(
        resourceType
      )
        .trim()
        .toLowerCase();

      if (
        !RESOURCE_TYPES.includes(normalizedType)
      ) {
        return fail(
          res,
          400,
          "Invalid resource type."
        );
      }

      query.resourceType = normalizedType;
    }

    const [books, total] =
      await Promise.all([
        populateIncludedBooks(
          Book.find(query)
            .sort({
              position: 1,
              createdAt: -1,
            })
            .skip(
              (pageNumber - 1) *
                limitNumber
            )
            .limit(limitNumber)
        ).lean(),

        Book.countDocuments(query),
      ]);

    return res.status(200).json({
      success: true,
      data: books,

      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        pages: Math.ceil(
          total / limitNumber
        ),
      },
    });
  });

// =====================================================
// UPDATE BOOK BY ID - PUT / PATCH
// =====================================================

// export const updateBookByBookId =
//   asyncHandler(async (req, res) => {
//     const { bookId } = req.params;

//     if (
//       !mongoose.Types.ObjectId.isValid(bookId)
//     ) {
//       return fail(
//         res,
//         400,
//         "Invalid product ID."
//       );
//     }

//     const adminId = getAdminId(req);

//     if (!adminId) {
//       return fail(
//         res,
//         401,
//         "Unauthorized."
//       );
//     }

//     const book =
//       await Book.findById(bookId);

//     if (!book) {
//       return fail(
//         res,
//         404,
//         "Product not found."
//       );
//     }

//     const oldRedirectUrl =
//       book.redirectUrl;

//     // ---------------------------------------------
//     // UPDATE STRING FIELDS
//     // ---------------------------------------------

//     const stringFields = [
//       "title",
//       "subtitle",
//       "description",
//       "paymentUrl",
//       "redirectUrl",
//       "pageKey",
//       "fileName",
//       "category",
//       "badge",
//       "slug",
//       "currency",
//       "resourceType",
//     ];

//     const lowerFields = [
//       "slug",
//       "pageKey",
//       "resourceType",
//     ];

//     for (const key of stringFields) {
//       if (
//         req.body[key] === undefined
//       ) {
//         continue;
//       }

//       let value = String(
//         req.body[key]
//       ).trim();

//       if (lowerFields.includes(key)) {
//         value = value.toLowerCase();
//       }

//       if (key === "currency") {
//         value = value.toUpperCase();
//       }

//       book[key] = value;
//     }

//     // ---------------------------------------------
//     // UPDATE NUMERIC FIELDS
//     // ---------------------------------------------

//     for (const key of ["price", "mrp"]) {
//       if (
//         req.body[key] !== undefined
//       ) {
//         book[key] =
//           req.body[key] === ""
//             ? NaN
//             : Number(req.body[key]);
//       }
//     }

//     // ---------------------------------------------
//     // UPDATE ARRAY FIELDS
//     // ---------------------------------------------

//     try {
//       const arrayFields = [
//         "tags",
//         "topics",
//         "highlights",
//         "includedBooks",
//       ];

//       for (const key of arrayFields) {
//         if (
//           req.body[key] !== undefined
//         ) {
//           book[key] = parseArray(
//             req.body[key]
//           );
//         }
//       }
//     } catch (error) {
//       return fail(
//         res,
//         400,
//         error.message
//       );
//     }

//     // ---------------------------------------------
//     // UPDATE BOOLEAN FIELDS
//     // ---------------------------------------------

//     const booleanFields = [
//       "isPublished",
//       "isActive",
//       "isFeatured",
//     ];

//     for (const key of booleanFields) {
//       if (
//         req.body[key] !== undefined
//       ) {
//         book[key] = parseBoolean(
//           req.body[key],
//           book[key]
//         );
//       }
//     }

//     // ---------------------------------------------
//     // VALIDATE UPDATED PRODUCT
//     // ---------------------------------------------

//     const validationError =
//       validateCompleteProduct(book);

//     if (validationError) {
//       return fail(
//         res,
//         400,
//         validationError
//       );
//     }

//     // Validate included books when updating combo
//     const includedError =
//       await validateIncludedBooks({
//         resourceType: book.resourceType,
//         includedBooks:
//           book.includedBooks || [],
//         excludeId: book._id,
//       });

//     if (includedError) {
//       return fail(
//         res,
//         400,
//         includedError
//       );
//     }

//     const duplicate =
//       await findDuplicateProduct({
//         slug: book.slug,
//         pageKey: book.pageKey,
//         redirectUrl: book.redirectUrl,
//         excludeId: book._id,
//       });

//     if (duplicate) {
//       return fail(
//         res,
//         409,
//         getDuplicateMessage(
//           duplicate,
//           book
//         )
//       );
//     }

//     // ---------------------------------------------
//     // VALIDATE UPLOADED FILES
//     // ---------------------------------------------

//     const coverFile =
//       req.files?.coverPage?.[0];

//     const pdfFile =
//       req.files?.pdf?.[0];

//     if (
//       book.resourceType === "bundle" &&
//       pdfFile
//     ) {
//       return fail(
//         res,
//         400,
//         "Bundles use included book PDFs. Do not upload a separate bundle PDF."
//       );
//     }

//     if (
//       !book.coverPageUrl &&
//       !coverFile
//     ) {
//       return fail(
//         res,
//         400,
//         "Cover page file is required."
//       );
//     }

//     if (
//       ["pdf", "ebook"].includes(
//         book.resourceType
//       ) &&
//       !book.pdfUrl &&
//       !pdfFile
//     ) {
//       return fail(
//         res,
//         400,
//         "PDF file is required for this resource type."
//       );
//     }

//     // ---------------------------------------------
//     // UPLOAD NEW FILES IF PROVIDED
//     // ---------------------------------------------

//     try {
//       if (coverFile) {
//         const coverUpload =
//           await uploadProductFile(
//             coverFile
//           );

//         book.coverPageUrl =
//           coverUpload.secure_url;
//       }

//       if (pdfFile) {
//         const pdfUpload =
//           await uploadProductFile(
//             pdfFile
//           );

//         book.pdfUrl =
//           pdfUpload.secure_url;

//         if (
//           req.body.fileName ===
//           undefined
//         ) {
//           book.fileName =
//             pdfFile.originalname || "";
//         }
//       }
//     } catch (error) {
//       console.error(
//         "Cloudinary Upload Error:",
//         error
//       );

//       return fail(
//         res,
//         500,
//         "Failed to upload product files."
//       );
//     }

//     // A bundle does not own a separate PDF.
//     if (book.resourceType === "bundle") {
//       book.pdfUrl = "";
//       book.fileName = "";
//     }

//     book.updatedBy = adminId;

//     await book.save();

//     // Invalidate both old and new cached URLs
//     await clearBookCaches(
//       oldRedirectUrl,
//       book.redirectUrl
//     );

//     // Invalidate combo responses containing this book
//     await clearRelatedBundleCaches(book._id);

//     const result =
//       await populateIncludedBooks(
//         Book.findById(book._id)
//       );

//     return res.status(200).json({
//       success: true,
//       message: "Product updated successfully.",
//       data: result,
//     });
//   });


export const updateBookByBookId =
  asyncHandler(async (req, res) => {
    const { bookId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return fail(
        res,
        400,
        "Invalid product ID."
      );
    }

    const adminId = getAdminId(req);

    if (!adminId) {
      return fail(
        res,
        401,
        "Unauthorized."
      );
    }

    const book = await Book.findById(bookId);

    if (!book) {
      return fail(
        res,
        404,
        "Product not found."
      );
    }

    const oldRedirectUrl = book.redirectUrl;

    // ---------------------------------------------
    // UPDATE STRING FIELDS
    // ---------------------------------------------

    const stringFields = [
      "title",
      "subtitle",
      "description",
      "paymentUrl",
      "redirectUrl",
      "pageKey",
      "fileName",
      "category",
      "badge",
      "slug",
      "currency",
      "resourceType",
    ];

    const lowerFields = [
      "slug",
      "pageKey",
      "resourceType",
    ];

    for (const key of stringFields) {
      if (req.body[key] === undefined) {
        continue;
      }

      let value = String(
        req.body[key]
      ).trim();

      if (lowerFields.includes(key)) {
        value = value.toLowerCase();
      }

      if (key === "currency") {
        value = value.toUpperCase();
      }

      book[key] = value;
    }

    // ---------------------------------------------
    // UPDATE NUMERIC FIELDS
    // ---------------------------------------------

    for (const key of ["price", "mrp"]) {
      if (req.body[key] !== undefined) {
        book[key] =
          req.body[key] === ""
            ? NaN
            : Number(req.body[key]);
      }
    }

    // ---------------------------------------------
    // PREP ARENA MATCHES + PACK TYPE
    // ---------------------------------------------

    try {
      if (req.body.matches !== undefined) {
        book.matches = parseMatches(req.body.matches);
      }
      if (req.body.packPlan !== undefined) {
        book.membership = { plan: parsePackPlan(req.body.packPlan) };
      }
    } catch (error) {
      return fail(res, 400, error.message);
    }

    // ---------------------------------------------
    // UPDATE ARRAY FIELDS
    // ---------------------------------------------

    try {
      const arrayFields = [
        "tags",
        "topics",
        "highlights",
        "includedBooks",
      ];

      for (const key of arrayFields) {
        if (req.body[key] !== undefined) {
          book[key] = parseArray(
            req.body[key]
          );
        }
      }
    } catch (error) {
      return fail(
        res,
        400,
        error.message
      );
    }

    // ---------------------------------------------
    // UPDATE BOOLEAN FIELDS
    // ---------------------------------------------

    const booleanFields = [
      "isPublished",
      "isActive",
      "isFeatured",
      "showInMainBooks",
      "sendEbookEmailOnPurchase",
    ];

    for (const key of booleanFields) {
      if (req.body[key] !== undefined) {
        book[key] = parseBoolean(
          req.body[key],
          book[key]
        );
      }
    }

    // ---------------------------------------------
    // VALIDATE UPDATED PRODUCT
    // ---------------------------------------------

    const validationError =
      validateCompleteProduct(book);

    if (validationError) {
      return fail(
        res,
        400,
        validationError
      );
    }

    // Validate included books when updating combo
    const includedError =
      await validateIncludedBooks({
        resourceType: book.resourceType,
        includedBooks: book.includedBooks || [],
        excludeId: book._id,
      });

    if (includedError) {
      return fail(
        res,
        400,
        includedError
      );
    }

    // ---------------------------------------------
    // CHECK DUPLICATES
    // ---------------------------------------------

    const duplicate =
      await findDuplicateProduct({
        slug: book.slug,
        pageKey: book.pageKey,
        redirectUrl: book.redirectUrl,
        excludeId: book._id,
      });

    if (duplicate) {
      return fail(
        res,
        409,
        getDuplicateMessage(
          duplicate,
          book
        )
      );
    }

    // ---------------------------------------------
    // VALIDATE UPLOADED FILES
    // ---------------------------------------------

    const coverFile =
      req.files?.coverPage?.[0];

    const pdfFile =
      req.files?.pdf?.[0];

    if (
      book.resourceType === "bundle" &&
      pdfFile
    ) {
      return fail(
        res,
        400,
        "Bundles use included book PDFs. Do not upload a separate bundle PDF."
      );
    }

    if (
      !book.coverPageUrl &&
      !coverFile
    ) {
      return fail(
        res,
        400,
        "Cover page file is required."
      );
    }

    if (
      ["pdf", "ebook"].includes(
        book.resourceType
      ) &&
      !book.pdfUrl &&
      !pdfFile
    ) {
      return fail(
        res,
        400,
        "PDF file is required for this resource type."
      );
    }

    // ---------------------------------------------
    // UPLOAD NEW FILES IF PROVIDED
    // ---------------------------------------------

    try {
      if (coverFile) {
        const coverUpload =
          await uploadProductFile(
            coverFile
          );

        book.coverPageUrl =
          coverUpload.secure_url;
      }

      if (pdfFile) {
        const pdfUpload =
          await uploadProductFile(
            pdfFile
          );

        book.pdfUrl =
          pdfUpload.secure_url;

        if (req.body.fileName === undefined) {
          book.fileName =
            pdfFile.originalname || "";
        }
      }
    } catch (error) {
      console.error(
        "Cloudinary Upload Error:",
        error
      );

      return fail(
        res,
        500,
        "Failed to upload product files."
      );
    }

    // ---------------------------------------------
    // BUNDLE PDF HANDLING
    // ---------------------------------------------

    if (book.resourceType === "bundle") {
      book.pdfUrl = "";
      book.fileName = "";
    }

    // ---------------------------------------------
    // SAVE UPDATED PRODUCT
    // ---------------------------------------------

    book.updatedBy = adminId;

    await book.save();

    // ---------------------------------------------
    // INVALIDATE CACHES
    // ---------------------------------------------

    await clearBookCaches(
      oldRedirectUrl,
      book.redirectUrl
    );

    await clearRelatedBundleCaches(
      book._id
    );

    // ---------------------------------------------
    // RETURN UPDATED PRODUCT
    // ---------------------------------------------

    const result =
      await populateIncludedBooks(
        Book.findById(book._id)
      );

    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      data: result,
    });
  });

// =====================================================
// DELETE BOOK BY ID
// =====================================================

export const deleteBookById =
  asyncHandler(async (req, res) => {
    const { bookId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(bookId)
    ) {
      return fail(
        res,
        400,
        "Invalid product ID."
      );
    }

    const adminId = getAdminId(req);

    if (!adminId) {
      return fail(
        res,
        401,
        "Unauthorized."
      );
    }

    const book =
      await Book.findById(bookId);

    if (!book) {
      return fail(
        res,
        404,
        "Product not found."
      );
    }

    // Don't delete standalone books that are
    // currently included inside a bundle.
    const usedByBundle =
      await Book.findOne({
        resourceType: "bundle",
        includedBooks: book._id,
      })
        .select("_id title")
        .lean();

    if (usedByBundle) {
      return fail(
        res,
        409,
        `This book is included in bundle "${usedByBundle.title}". Remove it from the bundle before deleting.`
      );
    }

    const redirectUrl =
      book.redirectUrl;

    await book.deleteOne();

    await clearBookCaches(
      redirectUrl
    );

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
    });
  });
