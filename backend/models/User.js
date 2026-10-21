
// import mongoose from "mongoose";

// const { Schema } = mongoose;

// const affiliateSchema = new Schema(
//   {
//     code: {
//       type: String,
//       uppercase: true,
//       trim: true,
//       match: /^[A-Z0-9_-]{3,30}$/,
//     },

//     commissionType: {
//       type: String,
//       enum: ["percentage", "fixed"],
//     },

//     commissionValue: {
//       type: Number,
//       min: 0,
//       default: 0,
//     },

//     joinedAt: {
//       type: Date,
//       default: Date.now,
//     },
//   },
//   { _id: false }
// );


// const userSchema = new Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//       maxlength: 100,
//     },

//     email: {
//       type: String,
//       required: true,
//       lowercase: true,
//       trim: true,
//       match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
//     },

//     mobile: {
//       type: String,
//       trim: true,
//     },

//     password: {
//       type: String,
//       required: true,
//       select: false,
//     },

//     role: {
//       type: String,
//       enum: [
//         "admin",
//         "normal",
//         "Employee",
//         "affiliate",
//       ],
//       default: "normal",
//       index: true,
//     },


//     status: {
//       type: String,
//       enum: [
//         "active",
//         "inactive",
//         "suspended",
//         "blocked",
//       ],
//       default: "active",
//       index: true,
//     },

//     statusReason: {
//       type: String,
//       maxlength: 500,
//       default: null,
//     },

//     statusChangedAt: {
//       type: Date,
//       default: null,
//     },

//     affiliate: {
//       type: affiliateSchema,
//       default: undefined,
//     },


//     // Increment to invalidate all existing JWTs
//     tokenVersion: {
//       type: Number,
//       default: 0,
//       select: false,
//     },

//     passwordChangedAt: {
//       type: Date,
//       default: null,
//     },

//     lastLoginAt: {
//       type: Date,
//       default: null,
//     },

//     failedLoginAttempts: {
//       type: Number,
//       default: 0,
//       select: false,
//     },

//     lockedUntil: {
//       type: Date,
//       default: null,
//       select: false,
//     },

//     createdBy: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//       default: null,
//     },
//   },
//   {
//     timestamps: true,
//     optimisticConcurrency: true,
//   }
// );

// /* =========================
//    INDEXES
// ========================= */

// userSchema.index(
//   { email: 1 },
//   { unique: true }
// );

// userSchema.index(
//   { mobile: 1 },
//   {
//     unique: true,
//     partialFilterExpression: {
//       mobile: { $type: "string" },
//     },
//   }
// );

// userSchema.index(
//   { "affiliate.code": 1 },
//   {
//     unique: true,
//     partialFilterExpression: {
//       "affiliate.code": { $type: "string" },
//     },
//   }
// );

// /* =========================
//    VALIDATION
// ========================= */

// userSchema.pre("validate", function () {
//   if (this.role === "affiliate") {
//     if (
//       !this.affiliate?.code ||
//       !this.affiliate?.commissionType
//     ) {
//       this.invalidate(
//         "affiliate",
//         "Affiliate code and commission type are required"
//       );
//       return;
//     }

//     const { commissionType, commissionValue } =
//       this.affiliate;

//     if (
//       commissionType === "percentage" &&
//       commissionValue > 100
//     ) {
//       this.invalidate(
//         "affiliate.commissionValue",
//         "Percentage cannot exceed 100"
//       );
//     }

//     if (
//       commissionType === "fixed" &&
//       !Number.isSafeInteger(commissionValue)
//     ) {
//       this.invalidate(
//         "affiliate.commissionValue",
//         "Fixed commission must be in whole paise"
//       );
//     }
//   } else if (this.affiliate) {
//     this.invalidate(
//       "affiliate",
//       "Affiliate settings require affiliate role"
//     );
//   }
// });

// /* =========================
//    SAFE JSON OUTPUT
// ========================= */

// userSchema.set("toJSON", {
//   transform(_doc, ret) {
//     delete ret.password;
//     delete ret.tokenVersion;
//     delete ret.failedLoginAttempts;
//     delete ret.lockedUntil;
//     delete ret.__v;
//     return ret;
//   },
// });

// export default mongoose.models.User ||
//   mongoose.model("User", userSchema);


import mongoose from "mongoose";

const { Schema } = mongoose;

/* =====================================================
   AFFILIATE CONFIGURATION SCHEMA
===================================================== */

const affiliateSchema = new Schema(
  {
    code: {
      type: String,
      required: [true, "Affiliate code is required"],
      trim: true,
      uppercase: true,
      minlength: 3,
      maxlength: 30,
      match: [
        /^[A-Z0-9_-]{3,30}$/,
        "Affiliate code can contain uppercase letters, numbers, - and _ only",
      ],
    },

    commissionType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: [true, "Commission type is required"],
    },

    commissionValue: {
      type: Number,
      required: [true, "Commission value is required"],
      min: [0.01, "Commission must be greater than zero"],
      validate: {
        validator(value) {
          if (this.commissionType === "percentage") {
            return value > 0 && value <= 100;
          }

          return value > 0;
        },
        message: "Invalid commission value",
      },
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      required: true,
    },
  },
  {
    _id: false,
  }
);

/* =====================================================
   USER SCHEMA
===================================================== */

const userSchema = new Schema(
  {
    /* =========================================
       BASIC INFORMATION
    ========================================= */

    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must contain at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email",
      ],
    },

    mobile: {
      type: String,
      trim: true,
      default: undefined,
      match: [
        /^[6-9]\d{9}$/,
        "Please enter a valid 10-digit mobile number",
      ],
    },

    /* =========================================
       AUTHENTICATION
    ========================================= */

    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },

    role: {
      type: String,
      enum: ["admin", "normal", "Employee", "affiliate"],
      default: "normal",
      required: true,
      index: true,
    },

    /* =========================================
       AFFILIATE CONFIGURATION

       Only affiliate users should have
       this subdocument.

       Non-affiliate users will not have
       an affiliate field.
    ========================================= */

    affiliate: {
      type: affiliateSchema,
      default: undefined,
    },

    /* =========================================
       ACCOUNT STATUS
    ========================================= */

    status: {
      type: String,
      enum: [
        "active",
        "inactive",
        "suspended",
        "blocked",
      ],
      default: "active",
      index: true,
    },

    statusReason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },

    statusChangedAt: {
      type: Date,
      default: null,
    },

    statusChangedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    /* =========================================
       LOGIN SECURITY
    ========================================= */

    tokenVersion: {
      type: Number,
      default: 0,
      min: 0,
      select: false,
    },

    failedLoginAttempts: {
      type: Number,
      default: 0,
      min: 0,
      select: false,
    },

    lockedUntil: {
      type: Date,
      default: null,
      select: false,
    },

    passwordChangedAt: {
      type: Date,
      default: null,
    },

    // Newly created accounts must set their
    // password using the secure setup link.
    mustChangePassword: {
      type: Boolean,
      default: true,
    },

    /* =========================================
       LOGIN INFORMATION
    ========================================= */

    lastLoginAt: {
      type: Date,
      default: null,
    },

    /* =========================================
       ADMIN MANAGEMENT
    ========================================= */

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    /* =========================================
       SOFT DELETE
    ========================================= */

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
  }
);

/* =====================================================
   DATABASE INDEXES
===================================================== */

// Email must be globally unique, including
// soft-deleted user accounts.
userSchema.index(
  { email: 1 },
  { unique: true }
);

// Admin accounts may have no mobile number.
// Non-admin accounts require one.
userSchema.index(
  { mobile: 1 },
  {
    unique: true,
    partialFilterExpression: {
      mobile: { $type: "string" },
    },
  }
);

// Affiliate code must be unique across users.
// Only documents containing a string code
// participate in this index.
userSchema.index(
  { "affiliate.code": 1 },
  {
    unique: true,
    partialFilterExpression: {
      "affiliate.code": {
        $type: "string",
      },
    },
  }
);

userSchema.index({
  role: 1,
  status: 1,
  createdAt: -1,
});

/* =====================================================
   DOCUMENT VALIDATION
===================================================== */

userSchema.pre("validate", function () {
  /* =========================================
     MOBILE VALIDATION
  ========================================= */

  if (this.role !== "admin" && !this.mobile) {
    this.invalidate(
      "mobile",
      "Mobile number is required for non-admin users"
    );
  }

  /* =========================================
     SOFT DELETE STATUS VALIDATION
  ========================================= */

  if (this.isDeleted && this.status === "active") {
    this.invalidate(
      "status",
      "Deleted users cannot be active"
    );
  }

  /* =========================================
     AFFILIATE VALIDATION
  ========================================= */

  if (this.role === "affiliate") {
    if (!this.affiliate) {
      this.invalidate(
        "affiliate",
        "Affiliate configuration is required"
      );
      return;
    }

    const {
      code,
      commissionType,
      commissionValue,
      status,
    } = this.affiliate;

    if (!code) {
      this.invalidate(
        "affiliate.code",
        "Affiliate code is required"
      );
    }

    if (
      !["percentage", "fixed"].includes(
        commissionType
      )
    ) {
      this.invalidate(
        "affiliate.commissionType",
        "Invalid affiliate commission type"
      );
    }

    if (
      !Number.isFinite(commissionValue) ||
      commissionValue <= 0
    ) {
      this.invalidate(
        "affiliate.commissionValue",
        "Commission value must be greater than zero"
      );
    }

    if (
      commissionType === "percentage" &&
      commissionValue > 100
    ) {
      this.invalidate(
        "affiliate.commissionValue",
        "Percentage commission cannot exceed 100%"
      );
    }

    if (
      !["active", "inactive"].includes(status)
    ) {
      this.invalidate(
        "affiliate.status",
        "Invalid affiliate status"
      );
    }
  } else {
    // Prevent retaining affiliate data when
    // a document changes to another role.
    this.affiliate = undefined;
  }
});

/* =====================================================
   INSTANCE METHODS
===================================================== */

// Returns whether this account can log in.
userSchema.methods.canLogin = function () {
  return (
    this.status === "active" &&
    this.isDeleted === false &&
    (!this.lockedUntil ||
      this.lockedUntil.getTime() <= Date.now())
  );
};

// Returns whether the user is an active affiliate.
userSchema.methods.isActiveAffiliate = function () {
  return (
    this.role === "affiliate" &&
    this.affiliate?.status === "active" &&
    this.status === "active" &&
    this.isDeleted === false
  );
};

// Returns estimated affiliate commission
// on an eligible sale amount.
//
// This method is for calculating an amount;
// actual earnings must be persisted against
// a verified payment transaction.
userSchema.methods.calculateAffiliateCommission =
  function (saleAmount) {
    if (!this.isActiveAffiliate()) {
      return 0;
    }

    const amount = Number(saleAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return 0;
    }

    const {
      commissionType,
      commissionValue,
    } = this.affiliate;

    let commission = 0;

    if (commissionType === "percentage") {
      commission =
        (amount * commissionValue) / 100;
    } else if (commissionType === "fixed") {
      commission = commissionValue;
    }

    // Rounding to two decimal places.
    return Math.round(
      (commission + Number.EPSILON) * 100
    ) / 100;
  };

// Returns user information without
// sensitive authentication fields.
userSchema.methods.toSafeObject = function () {
  const user = this.toObject();

  delete user.password;
  delete user.tokenVersion;
  delete user.failedLoginAttempts;
  delete user.lockedUntil;

  return user;
};

/* =====================================================
   JSON TRANSFORMATION
===================================================== */

userSchema.set("toJSON", {
  transform(_doc, ret) {
    delete ret.password;
    delete ret.tokenVersion;
    delete ret.failedLoginAttempts;
    delete ret.lockedUntil;
    delete ret.__v;

    return ret;
  },
});

/* =====================================================
   MODEL EXPORT
===================================================== */

const User =
  mongoose.models.User ||
  mongoose.model("User", userSchema);

export default User;
