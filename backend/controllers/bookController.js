import Book from "../models/Book.js";
import uploadFile from "../utils/cloudinary.js";
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

const getAdminId = (req) => {
  return req.user?.userId?.toString() || null;
};
const parseArray = (value) => {
  if (value === undefined || value === null || value === "") {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => String(item).trim())
          .filter(Boolean);
      }
    } catch {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
};

const parseBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }

  if (value === 1 || value === "1") return true;
  if (value === 0 || value === "0") return false;

  return defaultValue;
};

const isValidUrl = (value) => {
  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
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
  if (!value || typeof value !== "string") {
    return false;
  }

  const normalized = value.trim();

  return (
    normalized.startsWith("/") &&
    normalized.length > 1 &&
    !normalized.startsWith("//")
  );
};

const uploadProductFile = async (file) => {
  if (!file?.path) {
    throw new Error("Invalid uploaded file.");
  }

  const result = await uploadFile(file.path);

  if (!result?.secure_url) {
    throw new Error("Cloudinary did not return a secure URL.");
  }

  return result;
};

const validateCompleteProduct = (product) => {
  if (
    !product.title ||
    typeof product.title !== "string" ||
    product.title.trim().length < 3
  ) {
    return "Title is required and must be at least 3 characters.";
  }

  if (
    !product.slug ||
    typeof product.slug !== "string" ||
    !validateSlug(product.slug.trim().toLowerCase())
  ) {
    return "Valid slug is required.";
  }

  if (!RESOURCE_TYPES.includes(product.resourceType)) {
    return "Invalid resource type.";
  }

  const price = Number(product.price);
  const mrp = Number(product.mrp);

  if (!Number.isFinite(price) || price < 0) {
    return "Valid price is required.";
  }

  if (!Number.isFinite(mrp) || mrp < 0) {
    return "Valid MRP is required.";
  }

  if (mrp > 0 && price > mrp) {
    return "Price cannot be greater than MRP.";
  }

  if (
    !product.currency ||
    typeof product.currency !== "string" ||
    !/^[A-Za-z]{3}$/.test(product.currency.trim())
  ) {
    return "Currency must be a valid 3-letter currency code.";
  }

  if (
    !product.paymentUrl ||
    typeof product.paymentUrl !== "string" ||
    !isValidUrl(product.paymentUrl.trim())
  ) {
    return "Valid payment URL is required.";
  }

  if (!validateRedirectUrl(product.redirectUrl)) {
    return "Valid redirect URL is required.";
  }

  if (
    !product.pageKey ||
    typeof product.pageKey !== "string" ||
    !validatePageKey(product.pageKey.trim().toLowerCase())
  ) {
    return "Valid pageKey is required.";
  }

  return null;
};

const normalizeCreateData = (body) => {
  return {
    title: body.title?.trim(),
    slug: body.slug?.trim().toLowerCase(),
    subtitle: body.subtitle?.trim() || "",
    description: body.description?.trim() || "",
    resourceType: body.resourceType?.trim().toLowerCase() || "pdf",
    price: Number(body.price),
    mrp:
      body.mrp === undefined || body.mrp === ""
        ? 0
        : Number(body.mrp),
    currency: body.currency?.trim().toUpperCase() || "INR",
    paymentUrl: body.paymentUrl?.trim(),
    redirectUrl: body.redirectUrl?.trim(),
    pageKey: body.pageKey?.trim().toLowerCase(),
    fileName: body.fileName?.trim() || "",
    tags: parseArray(body.tags),
    topics: parseArray(body.topics),
    category: body.category?.trim() || "",
    highlights: parseArray(body.highlights),
    badge: body.badge?.trim() || "",
    isPublished: parseBoolean(body.isPublished, false),
    isActive: parseBoolean(body.isActive, true),
    isFeatured: parseBoolean(body.isFeatured, false),
  };
};

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

  return Book.findOne(query).select(
    "_id slug pageKey redirectUrl"
  );
};

const getDuplicateMessage = (
  duplicate,
  slug,
  pageKey,
  redirectUrl
) => {
  if (duplicate.slug === slug) {
    return "Slug already exists.";
  }

  if (duplicate.pageKey === pageKey) {
    return "Page key already exists.";
  }

  if (duplicate.redirectUrl === redirectUrl) {
    return "Redirect URL already exists.";
  }

  return "Product already exists.";
};

export const createBook = asyncHandler(async (req, res) => {
  const adminId = getAdminId(req);

  if (!adminId) {
    return res.status(401).json({
      success: false,
      error: {
        message: "Unauthorized.",
      },
    });
  }

  const productData = normalizeCreateData(req.body);

  const validationError =
    validateCompleteProduct(productData);

  if (validationError) {
    return res.status(400).json({
      success: false,
      error: {
        message: validationError,
      },
    });
  }

  const duplicate = await findDuplicateProduct({
    slug: productData.slug,
    pageKey: productData.pageKey,
    redirectUrl: productData.redirectUrl,
  });

  if (duplicate) {
    return res.status(409).json({
      success: false,
      error: {
        message: getDuplicateMessage(
          duplicate,
          productData.slug,
          productData.pageKey,
          productData.redirectUrl
        ),
      },
    });
  }

  const coverFile = req.files?.coverPage?.[0];
  const pdfFile = req.files?.pdf?.[0];

  if (!coverFile) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Cover page file is required.",
      },
    });
  }

  if (
    ["pdf", "ebook"].includes(
      productData.resourceType
    ) &&
    !pdfFile
  ) {
    return res.status(400).json({
      success: false,
      error: {
        message: "PDF file is required.",
      },
    });
  }

  let coverUpload;
  let pdfUpload = null;

  try {
    coverUpload = await uploadProductFile(coverFile);

    if (pdfFile) {
      pdfUpload = await uploadProductFile(pdfFile);
    }
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);

    return res.status(500).json({
      success: false,
      error: {
        message: "Failed to upload product files.",
      },
    });
  }

  const book = await Book.create({
    ...productData,

    coverPageUrl: coverUpload.secure_url,

    pdfUrl: pdfUpload?.secure_url || "",

    fileName:
      productData.fileName ||
      pdfFile?.originalname ||
      "",

    createdBy: adminId,
  });

  return res.status(201).json({
    success: true,
    message: "Product created successfully.",
    data: book,
  });
});

export const getAllBooks = asyncHandler(
  async (req, res) => {
    const books = await Book.find({
      isActive: true,
      isPublished: true,
    })
      .select(
        "title slug subtitle resourceType price mrp currency tags redirectUrl pageKey coverPageUrl category badge isFeatured"
      )
      .sort({
        isFeatured: -1,
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: books.length,
      data: books,
    });
  }
);

export const getProductByRedirectUrl = asyncHandler(
  async (req, res) => {
    let { redirectUrl } = req.query;

    if (!redirectUrl) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Redirect URL is required.",
        },
      });
    }

    try {
      redirectUrl = decodeURIComponent(
        redirectUrl
      ).trim();
    } catch {
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid redirect URL.",
        },
      });
    }

    if (!validateRedirectUrl(redirectUrl)) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid redirect URL.",
        },
      });
    }

    const product = await Book.findOne({
      redirectUrl,
      isActive: true,
      isPublished: true,
    })
      .select(
        "title price mrp paymentUrl redirectUrl coverPageUrl currency resourceType"
      )
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Product not found.",
        },
      });
    }

    await Book.updateOne(
      {
        _id: product._id,
      },
      {
        $inc: {
          "stats.views": 1,
        },
      }
    );

    return res.status(200).json({
      success: true,
      data: product,
    });
  }
);

export const getBookByIdForAdmin = asyncHandler(
  async (req, res) => {
    const { bookId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(bookId)
    ) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid product ID.",
        },
      });
    }

    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Product not found.",
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: book,
    });
  }
);

export const getAllBooksForAdmin = asyncHandler(
  async (req, res) => {
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

    if (search.trim()) {
      const escapedSearch = search
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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

    if (resourceType) {
      const normalizedResourceType =
        resourceType.trim().toLowerCase();

      if (
        !RESOURCE_TYPES.includes(
          normalizedResourceType
        )
      ) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Invalid resource type.",
          },
        });
      }

      query.resourceType =
        normalizedResourceType;
    }

    const [books, total] = await Promise.all([
      Book.find(query)
        .sort({
          createdAt: -1,
        })
        .skip(
          (pageNumber - 1) * limitNumber
        )
        .limit(limitNumber)
        .lean(),

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
  }
);

export const updateBookByBookId = asyncHandler(
  async (req, res) => {
    const { bookId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(bookId)
    ) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid product ID.",
        },
      });
    }

    const adminId = getAdminId(req);

    if (!adminId) {
      return res.status(401).json({
        success: false,
        error: {
          message: "Unauthorized.",
        },
      });
    }

    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Product not found.",
        },
      });
    }

    if (req.body.title !== undefined) {
      const title = String(
        req.body.title
      ).trim();

      if (title.length < 3) {
        return res.status(400).json({
          success: false,
          error: {
            message:
              "Title must be at least 3 characters.",
          },
        });
      }

      book.title = title;
    }

    if (req.body.slug !== undefined) {
      const slug = String(req.body.slug)
        .trim()
        .toLowerCase();

      if (!validateSlug(slug)) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Invalid slug.",
          },
        });
      }

      book.slug = slug;
    }

    if (req.body.subtitle !== undefined) {
      book.subtitle = String(
        req.body.subtitle
      ).trim();
    }

    if (
      req.body.description !== undefined
    ) {
      book.description = String(
        req.body.description
      ).trim();
    }

    if (
      req.body.resourceType !== undefined
    ) {
      const resourceType = String(
        req.body.resourceType
      )
        .trim()
        .toLowerCase();

      if (
        !RESOURCE_TYPES.includes(
          resourceType
        )
      ) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Invalid resource type.",
          },
        });
      }

      book.resourceType = resourceType;
    }

    if (req.body.price !== undefined) {
      const price = Number(
        req.body.price
      );

      if (
        !Number.isFinite(price) ||
        price < 0
      ) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Invalid price.",
          },
        });
      }

      book.price = price;
    }

    if (req.body.mrp !== undefined) {
      const mrp = Number(req.body.mrp);

      if (
        !Number.isFinite(mrp) ||
        mrp < 0
      ) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Invalid MRP.",
          },
        });
      }

      book.mrp = mrp;
    }

    if (
      req.body.currency !== undefined
    ) {
      const currency = String(
        req.body.currency
      )
        .trim()
        .toUpperCase();

      if (
        !/^[A-Z]{3}$/.test(currency)
      ) {
        return res.status(400).json({
          success: false,
          error: {
            message:
              "Currency must be a valid 3-letter currency code.",
          },
        });
      }

      book.currency = currency;
    }

    if (
      req.body.paymentUrl !== undefined
    ) {
      const paymentUrl = String(
        req.body.paymentUrl
      ).trim();

      if (!isValidUrl(paymentUrl)) {
        return res.status(400).json({
          success: false,
          error: {
            message:
              "Invalid payment URL.",
          },
        });
      }

      book.paymentUrl = paymentUrl;
    }

    if (
      req.body.redirectUrl !== undefined
    ) {
      const redirectUrl = String(
        req.body.redirectUrl
      ).trim();

      if (
        !validateRedirectUrl(
          redirectUrl
        )
      ) {
        return res.status(400).json({
          success: false,
          error: {
            message:
              "Invalid redirect URL.",
          },
        });
      }

      book.redirectUrl = redirectUrl;
    }

    if (
      req.body.pageKey !== undefined
    ) {
      const pageKey = String(
        req.body.pageKey
      )
        .trim()
        .toLowerCase();

      if (
        !validatePageKey(pageKey)
      ) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Invalid page key.",
          },
        });
      }

      book.pageKey = pageKey;
    }

    if (
      req.body.fileName !== undefined
    ) {
      book.fileName = String(
        req.body.fileName
      ).trim();
    }

    if (req.body.tags !== undefined) {
      book.tags = parseArray(
        req.body.tags
      );
    }

    if (
      req.body.topics !== undefined
    ) {
      book.topics = parseArray(
        req.body.topics
      );
    }

    if (
      req.body.category !== undefined
    ) {
      book.category = String(
        req.body.category
      ).trim();
    }

    if (
      req.body.highlights !== undefined
    ) {
      book.highlights = parseArray(
        req.body.highlights
      );
    }

    if (
      req.body.badge !== undefined
    ) {
      book.badge = String(
        req.body.badge
      ).trim();
    }

    if (
      req.body.isPublished !== undefined
    ) {
      book.isPublished =
        parseBoolean(
          req.body.isPublished,
          book.isPublished
        );
    }

    if (
      req.body.isActive !== undefined
    ) {
      book.isActive = parseBoolean(
        req.body.isActive,
        book.isActive
      );
    }

    if (
      req.body.isFeatured !== undefined
    ) {
      book.isFeatured =
        parseBoolean(
          req.body.isFeatured,
          book.isFeatured
        );
    }

    if (
      book.mrp > 0 &&
      book.price > book.mrp
    ) {
      return res.status(400).json({
        success: false,
        error: {
          message:
            "Price cannot be greater than MRP.",
        },
      });
    }

    const duplicate =
      await findDuplicateProduct({
        slug: book.slug,
        pageKey: book.pageKey,
        redirectUrl:
          book.redirectUrl,
        excludeId: book._id,
      });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        error: {
          message:
            getDuplicateMessage(
              duplicate,
              book.slug,
              book.pageKey,
              book.redirectUrl
            ),
        },
      });
    }

    const coverFile =
      req.files?.coverPage?.[0];

    const pdfFile =
      req.files?.pdf?.[0];

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

        if (
          req.body.fileName ===
          undefined
        ) {
          book.fileName =
            pdfFile.originalname || "";
        }
      }
    } catch (error) {
      console.error(
        "Cloudinary Upload Error:",
        error
      );

      return res.status(500).json({
        success: false,
        error: {
          message:
            "Failed to upload product files.",
        },
      });
    }

    if (!book.coverPageUrl) {
      return res.status(400).json({
        success: false,
        error: {
          message:
            "Cover page file is required.",
        },
      });
    }

    if (
      ["pdf", "ebook"].includes(
        book.resourceType
      ) &&
      !book.pdfUrl
    ) {
      return res.status(400).json({
        success: false,
        error: {
          message:
            "PDF file is required for this resource type.",
        },
      });
    }

    book.updatedBy = adminId;

    await book.save();

    return res.status(200).json({
      success: true,
      message:
        "Product updated successfully.",
      data: book,
    });
  }
);

export const deleteBookById = asyncHandler(
  async (req, res) => {
    const { bookId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(bookId)
    ) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid product ID.",
        },
      });
    }

    const book = await Book.findById(
      bookId
    );

    if (!book) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Product not found.",
        },
      });
    }

    await book.deleteOne();

    return res.status(200).json({
      success: true,
      message:
        "Product deleted successfully.",
    });
  }
);