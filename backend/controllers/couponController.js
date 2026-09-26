import mongoose from "mongoose";

import Coupon from "../models/Coupon.js";
import Book from "../models/Book.js";
import Order from "../models/Order.js";


const roundAmount = (amount) => {
  return Math.round((Number(amount) + Number.EPSILON) * 100) / 100;
};


const getAdminName = (req) => {
  return (
    req.user?.email ||
    req.user?.name ||
    req.user?._id?.toString() ||
    "admin"
  );
};


export const validateCouponForPayment = async ({
  couponCode,
  book,
  email,
}) => {
  const originalAmount = roundAmount(book.price);

  if (
    !couponCode ||
    typeof couponCode !== "string" ||
    !couponCode.trim()
  ) {
    return {
      couponApplied: false,

      coupon: null,

      originalAmount,

      discountAmount: 0,

      finalAmount: originalAmount,
    };
  }

  const normalizedCouponCode =
    couponCode.trim().toUpperCase();

  const coupon = await Coupon.findOne({
    code: normalizedCouponCode,
  });

  if (!coupon) {
    const error = new Error(
      "Invalid coupon code."
    );

    error.code = "COUPON_NOT_FOUND";
    error.statusCode = 400;

    throw error;
  }


  if (!coupon.isActive) {
    const error = new Error(
      "This coupon is currently inactive."
    );

    error.code = "COUPON_INACTIVE";
    error.statusCode = 400;

    throw error;
  }


  const now = new Date();


  if (
    coupon.validFrom &&
    new Date(coupon.validFrom) > now
  ) {
    const error = new Error(
      "This coupon is not active yet."
    );

    error.code = "COUPON_NOT_STARTED";
    error.statusCode = 400;

    throw error;
  }


  if (
    coupon.validTill &&
    new Date(coupon.validTill) < now
  ) {
    const error = new Error(
      "This coupon has expired."
    );

    error.code = "COUPON_EXPIRED";
    error.statusCode = 400;

    throw error;
  }


  if (
    coupon.usageLimit !== null &&
    coupon.usageLimit !== undefined &&
    coupon.usedCount >= coupon.usageLimit
  ) {
    const error = new Error(
      "This coupon has reached its usage limit."
    );

    error.code =
      "COUPON_USAGE_LIMIT_REACHED";

    error.statusCode = 400;

    throw error;
  }


  if (!coupon.appliesToAllBooks) {
    const isApplicable =
      coupon.applicableBooks.some(
        (bookId) =>
          String(bookId) ===
          String(book._id)
      );

    if (!isApplicable) {
      const error = new Error(
        "This coupon is not applicable to this book."
      );

      error.code =
        "COUPON_NOT_APPLICABLE";

      error.statusCode = 400;

      throw error;
    }
  }


  if (
    coupon.minimumOrderAmount &&
    originalAmount <
      coupon.minimumOrderAmount
  ) {
    const error = new Error(
      `Minimum order amount for this coupon is ₹${coupon.minimumOrderAmount}.`
    );

    error.code =
      "MINIMUM_ORDER_NOT_MET";

    error.statusCode = 400;

    throw error;
  }


  const normalizedEmail =
    typeof email === "string"
      ? email.trim().toLowerCase()
      : null;


  if (
    normalizedEmail &&
    coupon.perUserLimit !== null &&
    coupon.perUserLimit !== undefined
  ) {
    const userCouponUsage =
      await Order.countDocuments({
        "customer.email":
          normalizedEmail,

        "coupon.couponId":
          coupon._id,

        "coupon.applied":
          true,

        orderStatus:
          "PAID",

        "payment.status":
          "SUCCESS",
      });


    if (
      userCouponUsage >=
      coupon.perUserLimit
    ) {
      const error = new Error(
        "You have already used this coupon."
      );

      error.code =
        "COUPON_USER_LIMIT_REACHED";

      error.statusCode = 400;

      throw error;
    }
  }


  let discountAmount = 0;


  if (
    coupon.discountType ===
    "PERCENTAGE"
  ) {
    discountAmount =
      (originalAmount *
        coupon.discountValue) /
      100;


    if (
      coupon.maxDiscountAmount !==
        null &&
      coupon.maxDiscountAmount !==
        undefined
    ) {
      discountAmount =
        Math.min(
          discountAmount,
          coupon.maxDiscountAmount
        );
    }
  }


  if (
    coupon.discountType ===
    "FIXED"
  ) {
    discountAmount =
      coupon.discountValue;
  }


  discountAmount =
    Math.min(
      discountAmount,
      originalAmount
    );


  discountAmount =
    roundAmount(
      discountAmount
    );


  const finalAmount =
    roundAmount(
      originalAmount -
        discountAmount
    );


  if (finalAmount <= 0) {
    const error = new Error(
      "This coupon makes the order amount zero. Free checkout is currently not supported."
    );

    error.code =
      "ZERO_PAYMENT_AMOUNT";

    error.statusCode = 400;

    throw error;
  }


  return {
    couponApplied: true,

    coupon: {
      couponId:
        coupon._id,

      code:
        coupon.code,

      name:
        coupon.name,

      description:
        coupon.description,

      discountType:
        coupon.discountType,

      discountValue:
        coupon.discountValue,

      maxDiscountAmount:
        coupon.maxDiscountAmount,

      minimumOrderAmount:
        coupon.minimumOrderAmount,
    },

    originalAmount,

    discountAmount,

    finalAmount,
  };
};


export const validateCoupon = async (
  req,
  res
) => {
  try {
    const {
      couponCode,
      bookId,
      email,
    } = req.body;


    if (!couponCode) {
      return res.status(400).json({
        success: false,
        code: "COUPON_REQUIRED",
        message:
          "Coupon code is required.",
      });
    }


    if (!bookId) {
      return res.status(400).json({
        success: false,
        code: "BOOK_REQUIRED",
        message:
          "Book ID is required.",
      });
    }


    if (
      !mongoose.Types.ObjectId.isValid(
        bookId
      )
    ) {
      return res.status(400).json({
        success: false,
        code: "INVALID_BOOK_ID",
        message:
          "Invalid book ID.",
      });
    }


    const book =
      await Book.findOne({
        _id: bookId,

        isPublished: true,

        isActive: true,
      });


    if (!book) {
      return res.status(404).json({
        success: false,
        code: "BOOK_NOT_FOUND",
        message:
          "Book not found or unavailable.",
      });
    }


    const result =
      await validateCouponForPayment({
        couponCode,
        book,
        email,
      });


    return res.status(200).json({
      success: true,

      message:
        "Coupon applied successfully.",

      data: {
        couponCode:
          result.coupon.code,

        couponName:
          result.coupon.name,

        description:
          result.coupon.description,

        discountType:
          result.coupon
            .discountType,

        discountValue:
          result.coupon
            .discountValue,

        originalAmount:
          result.originalAmount,

        discountAmount:
          result.discountAmount,

        finalAmount:
          result.finalAmount,

        currency:
          book.currency ||
          "INR",
      },
    });
  } catch (error) {
    console.error(
      "Validate coupon error:",
      error
    );


    return res
      .status(
        error.statusCode ||
          500
      )
      .json({
        success: false,

        code:
          error.code ||
          "COUPON_VALIDATION_FAILED",

        message:
          error.message ||
          "Unable to validate coupon.",
      });
  }
};


export const createCoupon = async (
  req,
  res
) => {
  try {
    const {
      code,
      name,
      description,

      discountType,
      discountValue,

      maxDiscountAmount,

      minimumOrderAmount,

      applicableBooks,

      appliesToAllBooks,

      usageLimit,

      perUserLimit,

      validFrom,

      validTill,

      isActive,
    } = req.body;


    if (
      !code ||
      !name ||
      !discountType ||
      discountValue === undefined
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Code, name, discountType and discountValue are required.",
      });
    }


    if (
      ![
        "PERCENTAGE",
        "FIXED",
      ].includes(
        discountType
      )
    ) {
      return res.status(400).json({
        success: false,

        message:
          "discountType must be PERCENTAGE or FIXED.",
      });
    }


    const normalizedCode =
      code.trim().toUpperCase();


    const existingCoupon =
      await Coupon.findOne({
        code: normalizedCode,
      });


    if (existingCoupon) {
      return res.status(409).json({
        success: false,

        message:
          "Coupon code already exists.",
      });
    }


    const parsedDiscountValue =
      Number(discountValue);


    if (
      Number.isNaN(
        parsedDiscountValue
      ) ||
      parsedDiscountValue < 0
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid discount value.",
      });
    }


    if (
      discountType ===
        "PERCENTAGE" &&
      parsedDiscountValue > 100
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Percentage discount cannot exceed 100.",
      });
    }


    if (
      !appliesToAllBooks &&
      (
        !Array.isArray(
          applicableBooks
        ) ||
        applicableBooks.length === 0
      )
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Select at least one applicable book.",
      });
    }


    if (
      Array.isArray(
        applicableBooks
      )
    ) {
      for (
        const bookId of applicableBooks
      ) {
        if (
          !mongoose.Types.ObjectId.isValid(
            bookId
          )
        ) {
          return res
            .status(400)
            .json({
              success: false,

              message:
                "Invalid book ID in applicableBooks.",
            });
        }
      }


      if (
        applicableBooks.length > 0
      ) {
        const booksCount =
          await Book.countDocuments({
            _id: {
              $in:
                applicableBooks,
            },
          });


        if (
          booksCount !==
          applicableBooks.length
        ) {
          return res
            .status(400)
            .json({
              success: false,

              message:
                "One or more books do not exist.",
            });
        }
      }
    }


    if (
      validFrom &&
      validTill
    ) {
      if (
        new Date(validTill) <=
        new Date(validFrom)
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "validTill must be after validFrom.",
          });
      }
    }


    const coupon =
      await Coupon.create({
        code:
          normalizedCode,

        name:
          name.trim(),

        description:
          description?.trim() ||
          null,

        discountType,

        discountValue:
          parsedDiscountValue,

        maxDiscountAmount:
          maxDiscountAmount ===
            undefined ||
          maxDiscountAmount ===
            null ||
          maxDiscountAmount === ""
            ? null
            : Number(
                maxDiscountAmount
              ),

        minimumOrderAmount:
          minimumOrderAmount ===
            undefined ||
          minimumOrderAmount ===
            null ||
          minimumOrderAmount === ""
            ? 0
            : Number(
                minimumOrderAmount
              ),

        applicableBooks:
          appliesToAllBooks
            ? []
            : applicableBooks,

        appliesToAllBooks:
          Boolean(
            appliesToAllBooks
          ),

        usageLimit:
          usageLimit ===
            undefined ||
          usageLimit === null ||
          usageLimit === ""
            ? null
            : Number(
                usageLimit
              ),

        usedCount: 0,

        perUserLimit:
          perUserLimit ===
            undefined ||
          perUserLimit === null ||
          perUserLimit === ""
            ? 1
            : Number(
                perUserLimit
              ),

        validFrom:
          validFrom
            ? new Date(
                validFrom
              )
            : null,

        validTill:
          validTill
            ? new Date(
                validTill
              )
            : null,

        isActive:
          isActive ===
          undefined
            ? true
            : Boolean(
                isActive
              ),

        createdBy:
          getAdminName(req),
      });


    return res
      .status(201)
      .json({
        success: true,

        message:
          "Coupon created successfully.",

        data:
          coupon,
      });
  } catch (error) {
    console.error(
      "Create coupon error:",
      error
    );


    if (
      error.code === 11000
    ) {
      return res
        .status(409)
        .json({
          success: false,

          message:
            "Coupon code already exists.",
        });
    }


    return res
      .status(500)
      .json({
        success: false,

        message:
          "Unable to create coupon.",
      });
  }
};


export const getAllCoupons = async (
  req,
  res
) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      status,
    } = req.query;


    const pageNumber =
      Math.max(
        Number(page),
        1
      );


    const limitNumber =
      Math.min(
        Math.max(
          Number(limit),
          1
        ),
        100
      );


    const filter = {};


    if (search.trim()) {
      filter.$or = [
        {
          code: {
            $regex:
              search.trim(),

            $options:
              "i",
          },
        },

        {
          name: {
            $regex:
              search.trim(),

            $options:
              "i",
          },
        },
      ];
    }


    if (
      status === "active"
    ) {
      filter.isActive =
        true;
    }


    if (
      status === "inactive"
    ) {
      filter.isActive =
        false;
    }


    const skip =
      (pageNumber - 1) *
      limitNumber;


    const [
      coupons,
      total,
    ] =
      await Promise.all([
        Coupon.find(filter)
          .populate(
            "applicableBooks",
            "title slug price mrp coverPageUrl isActive isPublished"
          )
          .sort({
            createdAt:
              -1,
          })
          .skip(skip)
          .limit(
            limitNumber
          )
          .lean(),

        Coupon.countDocuments(
          filter
        ),
      ]);


    return res
      .status(200)
      .json({
        success: true,

        data:
          coupons,

        pagination: {
          page:
            pageNumber,

          limit:
            limitNumber,

          total,

          totalPages:
            Math.ceil(
              total /
                limitNumber
            ),
        },
      });
  } catch (error) {
    console.error(
      "Get coupons error:",
      error
    );


    return res
      .status(500)
      .json({
        success: false,

        message:
          "Unable to fetch coupons.",
      });
  }
};


export const getCouponById = async (
  req,
  res
) => {
  try {
    const {
      id,
    } = req.params;


    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Invalid coupon ID.",
        });
    }


    const coupon =
      await Coupon.findById(
        id
      )
        .populate(
          "applicableBooks",
          "title slug price mrp coverPageUrl isActive isPublished"
        )
        .lean();


    if (!coupon) {
      return res
        .status(404)
        .json({
          success: false,

          message:
            "Coupon not found.",
        });
    }


    return res
      .status(200)
      .json({
        success: true,

        data:
          coupon,
      });
  } catch (error) {
    console.error(
      "Get coupon error:",
      error
    );


    return res
      .status(500)
      .json({
        success: false,

        message:
          "Unable to fetch coupon.",
      });
  }
};


export const updateCoupon = async (
  req,
  res
) => {
  try {
    const {
      id,
    } = req.params;


    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Invalid coupon ID.",
        });
    }


    const coupon =
      await Coupon.findById(
        id
      );


    if (!coupon) {
      return res
        .status(404)
        .json({
          success: false,

          message:
            "Coupon not found.",
        });
    }


    const allowedFields = [
      "name",
      "description",
      "discountType",
      "discountValue",
      "maxDiscountAmount",
      "minimumOrderAmount",
      "applicableBooks",
      "appliesToAllBooks",
      "usageLimit",
      "perUserLimit",
      "validFrom",
      "validTill",
      "isActive",
    ];


    for (
      const field of allowedFields
    ) {
      if (
        req.body[field] !==
        undefined
      ) {
        coupon[field] =
          req.body[field];
      }
    }


    if (
      req.body.code !==
      undefined
    ) {
      const normalizedCode =
        String(
          req.body.code
        )
          .trim()
          .toUpperCase();


      const existingCoupon =
        await Coupon.findOne({
          code:
            normalizedCode,

          _id: {
            $ne:
              coupon._id,
          },
        });


      if (existingCoupon) {
        return res
          .status(409)
          .json({
            success: false,

            message:
              "Coupon code already exists.",
          });
      }


      coupon.code =
        normalizedCode;
    }


    if (
      coupon.discountType ===
        "PERCENTAGE" &&
      Number(
        coupon.discountValue
      ) > 100
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Percentage discount cannot exceed 100.",
        });
    }


    if (
      coupon.appliesToAllBooks
    ) {
      coupon.applicableBooks =
        [];
    }


    if (
      !coupon.appliesToAllBooks &&
      (
        !coupon.applicableBooks ||
        coupon.applicableBooks
          .length === 0
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Select at least one applicable book.",
        });
    }


    if (
      coupon.validFrom &&
      coupon.validTill &&
      new Date(
        coupon.validTill
      ) <=
        new Date(
          coupon.validFrom
        )
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "validTill must be after validFrom.",
        });
    }


    coupon.updatedBy =
      getAdminName(req);


    await coupon.save();


    return res
      .status(200)
      .json({
        success: true,

        message:
          "Coupon updated successfully.",

        data:
          coupon,
      });
  } catch (error) {
    console.error(
      "Update coupon error:",
      error
    );


    return res
      .status(500)
      .json({
        success: false,

        message:
          "Unable to update coupon.",
      });
  }
};


export const deleteCoupon = async (
  req,
  res
) => {
  try {
    const {
      id,
    } = req.params;


    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Invalid coupon ID.",
        });
    }


    const coupon =
      await Coupon.findById(
        id
      );


    if (!coupon) {
      return res
        .status(404)
        .json({
          success: false,

          message:
            "Coupon not found.",
        });
    }


    coupon.isActive =
      false;

    coupon.updatedBy =
      getAdminName(req);


    await coupon.save();


    return res
      .status(200)
      .json({
        success: true,

        message:
          "Coupon disabled successfully.",

        data:
          coupon,
      });
  } catch (error) {
    console.error(
      "Delete coupon error:",
      error
    );


    return res
      .status(500)
      .json({
        success: false,

        message:
          "Unable to delete coupon.",
      });
  }
};