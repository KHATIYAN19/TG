
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import User from "../models/User.js";
import UserSession from "../models/UserSession.js";

import sendMail from "../utils/MailSender.js";

import {
  authConfig,
  minutesFromNow,
} from "../config/auth.js";

import {
  randomToken,
  hashToken,
  hashPassword,
  logActivity,
  deviceInfo,
  getIp,
} from "../utils/authUtils.js";

import {
  provisionUserAuth,
  changeAccountSecurityState,
} from "../services/authStateService.js";

/* =====================================================
   CONSTANTS
===================================================== */

const ROLES = [
  "admin",
  "Employee",
  "normal",
  "affiliate",
];

const STATUSES = [
  "active",
  "inactive",
  "suspended",
  "blocked",
];

const AFFILIATE_STATUSES = [
  "active",
  "inactive",
];

const COMMISSION_TYPES = [
  "percentage",
  "fixed",
];

const EDITABLE_FIELDS = [
  "name",
  "email",
  "mobile",
  "role",
  "affiliate",
];

/* =====================================================
   RESPONSE HELPERS
===================================================== */

const fail = (res, status, message) => {
  return res.status(status).json({
    success: false,
    message,
  });
};

const validId = (id) =>
  mongoose.isValidObjectId(id);

const actorId = (req) =>
  req.user?.userId ||
  req.user?.id ||
  req.user?._id;

const validEmail = (email) =>
  typeof email === "string" &&
  email.length <= 254 &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validMobile = (mobile) =>
  typeof mobile === "string" &&
  /^[6-9]\d{9}$/.test(mobile);

const hasOwn = (obj, key) =>
  Object.prototype.hasOwnProperty.call(
    obj,
    key
  );

const safe = (user) => {
  if (!user) return null;

  if (typeof user.toSafeObject === "function") {
    return user.toSafeObject();
  }

  const obj =
    typeof user.toObject === "function"
      ? user.toObject()
      : { ...user };

  delete obj.password;
  delete obj.tokenVersion;
  delete obj.failedLoginAttempts;
  delete obj.lockedUntil;
  delete obj.__v;

  return obj;
};

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character]
  );

/* =====================================================
   AFFILIATE VALIDATION
===================================================== */

const validateAffiliate = (affiliate) => {
  if (
    !affiliate ||
    typeof affiliate !== "object" ||
    Array.isArray(affiliate)
  ) {
    return {
      error: "Affiliate configuration is required",
    };
  }

  const code = String(
    affiliate.code ?? ""
  )
    .trim()
    .toUpperCase();

  const commissionType =
    affiliate.commissionType;

  const commissionValue =
    affiliate.commissionValue;

  const status =
    affiliate.status ?? "active";

  if (!/^[A-Z0-9_-]{3,30}$/.test(code)) {
    return {
      error:
        "Affiliate code must contain 3–30 uppercase letters, numbers, - or _",
    };
  }

  if (!COMMISSION_TYPES.includes(commissionType)) {
    return {
      error:
        "Commission type must be percentage or fixed",
    };
  }

  // Require a numeric value, rather than allowing
  // null, empty strings, arrays or objects.
  if (
    typeof commissionValue !== "number" ||
    !Number.isFinite(commissionValue) ||
    commissionValue <= 0
  ) {
    return {
      error:
        "Commission value must be a number greater than zero",
    };
  }

  if (
    commissionType === "percentage" &&
    commissionValue > 100
  ) {
    return {
      error:
        "Percentage commission cannot exceed 100%",
    };
  }

  // Commission values use at most two decimals.
  if (
    Math.abs(
      commissionValue * 100 -
        Math.round(commissionValue * 100)
    ) > 1e-7
  ) {
    return {
      error:
        "Commission can contain at most two decimal places",
    };
  }

  if (!AFFILIATE_STATUSES.includes(status)) {
    return {
      error:
        "Affiliate status must be active or inactive",
    };
  }

  return {
    data: {
      code,
      commissionType,
      commissionValue,
      status,
    },
  };
};

/* =====================================================
   PARSE USER FIELDS
===================================================== */

const parseFields = (body) => {
  const data = {};

  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body)
  ) {
    return data;
  }

  for (const key of EDITABLE_FIELDS) {
    if (hasOwn(body, key)) {
      data[key] = body[key];
    }
  }

  if (typeof data.name === "string") {
    data.name = data.name.trim();
  }

  if (typeof data.email === "string") {
    data.email = data.email
      .trim()
      .toLowerCase();
  }

  if (typeof data.mobile === "string") {
    data.mobile = data.mobile.trim();

    if (data.mobile === "") {
      data.mobile = undefined;
    }
  }

  return data;
};

const validateFields = (data) => {
  if (
    data.name !== undefined &&
    (
      typeof data.name !== "string" ||
      data.name.length < 2 ||
      data.name.length > 100
    )
  ) {
    return "Invalid name";
  }

  if (
    data.email !== undefined &&
    !validEmail(data.email)
  ) {
    return "Invalid email";
  }

  if (
    data.mobile !== undefined &&
    data.mobile !== null &&
    !validMobile(data.mobile)
  ) {
    return "Invalid mobile number";
  }

  if (
    data.role !== undefined &&
    !ROLES.includes(data.role)
  ) {
    return "Invalid account role";
  }

  return null;
};

/* =====================================================
   ERROR HANDLING
===================================================== */

const handleError = (res, error) => {
  console.error(
    "Admin user controller:",
    error
  );

  if (error.code === 11000) {
    const duplicateField =
      Object.keys(error.keyPattern || {})[0] ||
      Object.keys(error.keyValue || {})[0];

    const messages = {
      email:
        "This email address is already registered",
      mobile:
        "This mobile number is already registered",
      "affiliate.code":
        "This affiliate code is already in use",
    };

    return fail(
      res,
      409,
      messages[duplicateField] ||
        "Account data already exists"
    );
  }

  if (error.name === "ValidationError") {
    return fail(
      res,
      400,
      error.message
    );
  }

  if (error.name === "VersionError") {
    return fail(
      res,
      409,
      "The account was modified by another request. Please retry."
    );
  }

  return fail(
    res,
    503,
    "Unable to complete operation"
  );
};

/* =====================================================
   PASSWORD CHALLENGE
===================================================== */

const createPasswordChallenge = async (
  req,
  user,
  purpose
) => {
  const token = randomToken();

  const expiresAt = minutesFromNow(
    authConfig.setupMinutes
  );

  const session = await UserSession.create({
    user: user._id,
    sessionId: randomUUID(),

    state: "pending_setup",
    purpose,

    challengeHash: hashToken(token),
    challengeExpiresAt: expiresAt,
    expiresAt,

    device: deviceInfo(req),
    ipAddress: getIp(req),
  });

  return {
    token,
    session,
  };
};

/* =====================================================
   PASSWORD SETUP EMAIL
===================================================== */

const sendPasswordSetupEmail = async (
  user,
  token,
  purpose
) => {
  if (!authConfig.frontendUrl) {
    throw new Error(
      "FRONTEND_URL missing"
    );
  }

  const isSetup =
    purpose === "setup";

  const route = isSetup
    ? "/set-password"
    : "/reset-password";

  const url = new URL(
    route,
    authConfig.frontendUrl
  );

  url.searchParams.set("token", token);

  const link = url.toString();

  const subject = isSetup
    ? "Set up your Target Trek account"
    : "Reset your Target Trek password";

  const heading = isSetup
    ? "Set up your account"
    : "Reset your password";

  const text = [
    `Hello ${user.name},`,
    "",
    isSetup
      ? "An administrator has created your Target Trek account."
      : "An administrator has requested a password reset for your Target Trek account.",
    "",
    "Use the secure link below:",
    link,
    "",
    `This link expires in ${authConfig.setupMinutes} minutes.`,
    "",
    "If you were not expecting this email, contact your administrator.",
    "",
    "Target Trek",
  ].join("\n");

  const html = `
    <div style="
      margin:0;
      padding:32px 16px;
      background:#f5f5f5;
      font-family:Arial,sans-serif;
      color:#171717;
    ">
      <div style="
        max-width:520px;
        margin:auto;
        background:#ffffff;
        border:1px solid #e5e5e5;
        border-radius:12px;
        overflow:hidden;
      ">
        <div style="
          height:5px;
          background:#F97316;
        "></div>

        <div style="padding:32px">
          <h2 style="
            margin:0 0 22px;
            font-size:22px;
          ">
            Target Trek
          </h2>

          <h3 style="
            margin:0 0 14px;
            font-size:19px;
          ">
            ${heading}
          </h3>

          <p style="
            color:#555555;
            line-height:1.8;
          ">
            Hello ${escapeHtml(user.name)},
          </p>

          <p style="
            color:#555555;
            line-height:1.8;
          ">
            ${isSetup
              ? "Your account has been created. Set your password to access your workspace."
              : "Use the link below to securely reset your account password."}
          </p>

          <div style="margin:28px 0">
            <a
              href="${escapeHtml(link)}"
              style="
                background:#F97316;
                color:#ffffff;
                padding:13px 22px;
                text-decoration:none;
                border-radius:7px;
                font-weight:bold;
                display:inline-block;
              "
            >
              ${isSetup
                ? "Set Password"
                : "Reset Password"}
            </a>
          </div>

          <p style="
            color:#777777;
            font-size:12px;
            line-height:1.8;
          ">
            This link expires in
            ${authConfig.setupMinutes} minutes.
            Do not share it with anyone.
          </p>

          <p style="
            color:#777777;
            font-size:12px;
            line-height:1.8;
          ">
            If you did not expect this email,
            contact your administrator.
          </p>
        </div>
      </div>
    </div>
  `;

  await sendMail(
    user.email,
    subject,
    text,
    html
  );
};

/* =====================================================
   ACTIVITY HELPER

   Security operations must not fail merely
   because audit logging is unavailable.
   Logging errors are still reported.
===================================================== */

const audit = async (options) => {
  try {
    await logActivity(options);
  } catch (error) {
    console.error(
      "User activity logging failed:",
      error
    );
  }
};

/* =====================================================
   CREATE USER

   POST /api/admin/users

   Supports:
   admin
   Employee
   normal
   affiliate
===================================================== */

export const createUser = async (
  req,
  res
) => {
  try {
    const data = parseFields(req.body);

    const validationError =
      validateFields(data);

    if (validationError) {
      return fail(
        res,
        400,
        validationError
      );
    }

    if (
      !data.name ||
      !data.email ||
      !data.role
    ) {
      return fail(
        res,
        400,
        "Name, email and role are required"
      );
    }

    if (
      data.role !== "admin" &&
      !validMobile(data.mobile)
    ) {
      return fail(
        res,
        400,
        "Mobile number is required for non-admin users"
      );
    }

    if (
      data.role === "admin" &&
      !data.mobile
    ) {
      delete data.mobile;
    }

    /* =========================================
       AFFILIATE VALIDATION
    ========================================= */

    let affiliateData;

    if (data.role === "affiliate") {
      const result = validateAffiliate(
        data.affiliate
      );

      if (result.error) {
        return fail(
          res,
          400,
          result.error
        );
      }

      affiliateData = result.data;
    }

    /* =========================================
       RANDOM INITIAL PASSWORD

       The user cannot log in before
       completing password setup.
    ========================================= */

    const initialPassword =
      randomToken(32);

    const passwordHash =
      await hashPassword(
        initialPassword
      );

    /* =========================================
       CREATE DATABASE USER
    ========================================= */

    const user = await User.create({
      name: data.name,
      email: data.email,

      ...(data.mobile
        ? { mobile: data.mobile }
        : {}),

      role: data.role,

      ...(data.role === "affiliate"
        ? {
            affiliate: affiliateData,
          }
        : {}),

      password: passwordHash,

      status: "active",
      isDeleted: false,
      mustChangePassword: true,

      createdBy: actorId(req),
    });

    /* =========================================
       REDIS AUTHORIZATION
    ========================================= */

    const securedUser =
      await User.findById(
        user._id
      ).select("+tokenVersion");

    await provisionUserAuth(
      securedUser
    );

    /* =========================================
       PASSWORD SETUP INVITATION
    ========================================= */

    const {
      token,
      session,
    } = await createPasswordChallenge(
      req,
      user,
      "setup"
    );

    let emailSent = false;

    try {
      await sendPasswordSetupEmail(
        user,
        token,
        "setup"
      );

      emailSent = true;
    } catch (mailError) {
      console.error(
        "Password setup mail failed:",
        mailError
      );

      await UserSession.deleteOne({
        _id: session._id,
      }).catch(console.error);
    }

    /* =========================================
       ACTIVITY
    ========================================= */

    await audit({
      req,
      user: user._id,
      actor: actorId(req),

      action: "ACCOUNT_CREATED",

      metadata: {
        role: user.role,
        emailSent,

        ...(user.role === "affiliate"
          ? {
              affiliateCode:
                user.affiliate.code,

              commissionType:
                user.affiliate
                  .commissionType,

              commissionValue:
                user.affiliate
                  .commissionValue,

              affiliateStatus:
                user.affiliate.status,
            }
          : {}),
      },
    });

    return res.status(201).json({
      success: true,
      emailSent,

      message: emailSent
        ? "User created. Password setup email sent."
        : "User created. Setup email failed; resend from admin panel.",

      user: safe(user),
    });
  } catch (error) {
    return handleError(
      res,
      error
    );
  }
};

/* =====================================================
   LIST USERS

   GET /api/admin/users

   Supports:
   role
   status
   affiliateStatus
   search
   page
   limit
===================================================== */

export const getAllUsers = async (
  req,
  res
) => {
  try {
    const page = Math.max(
      1,
      parseInt(
        req.query.page,
        10
      ) || 1
    );

    const limit = Math.min(
      100,
      Math.max(
        1,
        parseInt(
          req.query.limit,
          10
        ) || 20
      )
    );

    const filter = {
      isDeleted: false,
    };

    if (
      ROLES.includes(
        req.query.role
      )
    ) {
      filter.role =
        req.query.role;
    }

    if (
      STATUSES.includes(
        req.query.status
      )
    ) {
      filter.status =
        req.query.status;
    }

    if (
      AFFILIATE_STATUSES.includes(
        req.query.affiliateStatus
      )
    ) {
      filter.role = "affiliate";

      filter["affiliate.status"] =
        req.query.affiliateStatus;
    }

    if (
      typeof req.query.search === "string"
    ) {
      const search =
        req.query.search
          .trim()
          .slice(0, 80);

      if (search) {
        const q =
          escapeRegex(search);

        filter.$or = [
          {
            name: {
              $regex: q,
              $options: "i",
            },
          },
          {
            email: {
              $regex: q,
              $options: "i",
            },
          },
          {
            mobile: {
              $regex: q,
              $options: "i",
            },
          },
          {
            "affiliate.code": {
              $regex: q,
              $options: "i",
            },
          },
        ];
      }
    }

    const [users, total] =
      await Promise.all([
        User.find(filter)
          .select(
            "name email mobile role status " +
            "affiliate lastLoginAt " +
            "mustChangePassword " +
            "createdBy createdAt updatedAt"
          )
          .sort({
            createdAt: -1,
          })
          .skip(
            (page - 1) * limit
          )
          .limit(limit)
          .lean(),

        User.countDocuments(filter),
      ]);

    return res.json({
      success: true,

      users,

      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(
          total / limit
        ),
      },
    });
  } catch (error) {
    return handleError(
      res,
      error
    );
  }
};

/* =====================================================
   GET USER BY ID

   GET /api/admin/users/:userId
===================================================== */

export const getUserById = async (
  req,
  res
) => {
  try {
    const { userId } =
      req.params;

    if (!validId(userId)) {
      return fail(
        res,
        400,
        "Invalid user ID"
      );
    }

    const user =
      await User.findOne({
        _id: userId,
        isDeleted: false,
      });

    if (!user) {
      return fail(
        res,
        404,
        "User not found"
      );
    }

    return res.json({
      success: true,
      user: safe(user),
    });
  } catch (error) {
    return handleError(
      res,
      error
    );
  }
};

/* =====================================================
   UPDATE USER

   PATCH /api/admin/users/:userId

   Direct admin update.

   No email OTP required for updating
   email, mobile or affiliate settings.

   Role/email changes revoke sessions.
===================================================== */

export const updateUser = async (
  req,
  res
) => {
  try {
    const { userId } =
      req.params;

    if (!validId(userId)) {
      return fail(
        res,
        400,
        "Invalid user ID"
      );
    }

    const data =
      parseFields(req.body);

    const validationError =
      validateFields(data);

    if (validationError) {
      return fail(
        res,
        400,
        validationError
      );
    }

    if (
      Object.keys(data).length === 0
    ) {
      return fail(
        res,
        400,
        "No valid fields supplied"
      );
    }

   const existing = await User.findOne({
  _id: userId,
  isDeleted: false,
}).select("+password +tokenVersion");

    if (!existing) {
      return fail(
        res,
        404,
        "User not found"
      );
    }

    const currentActor =
      String(actorId(req));

    /* =========================================
       PREVENT SELF-DEMOTION
    ========================================= */

    if (
      String(existing._id) ===
        currentActor &&
      data.role &&
      data.role !== "admin"
    ) {
      return fail(
        res,
        403,
        "Cannot demote your own admin account"
      );
    }

    const targetRole =
      data.role ??
      existing.role;

    const targetMobile =
      hasOwn(data, "mobile")
        ? data.mobile
        : existing.mobile;

    if (
      targetRole !== "admin" &&
      !validMobile(targetMobile)
    ) {
      return fail(
        res,
        400,
        "A valid mobile number is required for non-admin users"
      );
    }

    /* =========================================
       AFFILIATE VALIDATION

       Supports partial edits.

       Example:
       {
         "affiliate": {
           "commissionValue": 25
         }
       }
    ========================================= */

    let nextAffiliate;

    if (
      targetRole === "affiliate"
    ) {
      const currentAffiliate =
        existing.role === "affiliate"
          ? existing.affiliate?.toObject?.() ||
            existing.affiliate ||
            {}
          : {};

      if (
        hasOwn(data, "affiliate") &&
        (
          !data.affiliate ||
          typeof data.affiliate !== "object" ||
          Array.isArray(data.affiliate)
        )
      ) {
        return fail(
          res,
          400,
          "Affiliate configuration must be an object"
        );
      }

      const mergedAffiliate = {
        ...currentAffiliate,
        ...(data.affiliate || {}),
      };

      const result =
        validateAffiliate(
          mergedAffiliate
        );

      if (result.error) {
        return fail(
          res,
          400,
          result.error
        );
      }

      nextAffiliate =
        result.data;
    } else {
      if (
        hasOwn(data, "affiliate") &&
        data.affiliate != null
      ) {
        return fail(
          res,
          400,
          "Affiliate configuration is only allowed for affiliate accounts"
        );
      }

      nextAffiliate = null;
    }

    const roleChanged =
      targetRole !==
      existing.role;

    const emailChanged =
      data.email !== undefined &&
      data.email !==
        existing.email;

    /* =========================================
       BUILD SAFE UPDATE

       No client-controlled password,
       tokenVersion or security state.
    ========================================= */

    const update = {};

    if (hasOwn(data, "name")) {
      update.name = data.name;
    }

    if (hasOwn(data, "email")) {
      update.email = data.email;
    }

    if (hasOwn(data, "mobile")) {
      update.mobile =
        data.mobile || undefined;
    }

    if (hasOwn(data, "role")) {
      update.role = targetRole;
    }

    if (
      targetRole === "affiliate"
    ) {
      update.affiliate =
        nextAffiliate;
    } else if (
      existing.role === "affiliate"
    ) {
      update.affiliate = null;
    }

    update.updatedBy =
      actorId(req);

    /* =========================================
       VALIDATE MERGED DOCUMENT

       This also enforces the Mongoose
       affiliate validation hook.
    ========================================= */

    const candidate =
      existing.toObject();

    Object.assign(
      candidate,
      update
    );

    const validationUser =
      new User(candidate);

    // Validate the candidate but do not save it.
    await validationUser.validate();

    /* =========================================
       SENSITIVE ACCOUNT UPDATE

       Role/email changes invalidate all
       existing JWT and refresh sessions.
    ========================================= */

    if (
      roleChanged ||
      emailChanged
    ) {
      const updated =
        await changeAccountSecurityState({
          userId,

          actorId:
            actorId(req),

          update,

          reason:
            "Admin changed account role or email",
        });

      await audit({
        req,
        user: userId,
        actor: actorId(req),

        action:
          "ACCOUNT_UPDATED",

        metadata: {
          roleChanged,
          emailChanged,

          previousRole:
            existing.role,

          currentRole:
            updated.role,

          affiliate:
            updated.affiliate || null,
        },
      });

      return res.json({
        success: true,

        requiresRelogin: true,

        message:
          "User updated. Existing sessions revoked.",

        user: safe(updated),
      });
    }

    /* =========================================
       NORMAL UPDATE

       Includes affiliate commission and
       status changes without relogin.

       Uses document validation and
       optimistic concurrency.
    ========================================= */

    Object.assign(
      existing,
      update
    );

    await existing.save();

    await audit({
      req,
      user: userId,
      actor: actorId(req),

      action:
        "ACCOUNT_UPDATED",

      metadata: {
        updatedFields:
          Object.keys(update),

        affiliate:
          existing.role === "affiliate"
            ? existing.affiliate?.toObject?.()
            : null,
      },
    });

    return res.json({
      success: true,

      requiresRelogin: false,

      message:
        "User updated successfully",

      user: safe(existing),
    });
  } catch (error) {
    return handleError(
      res,
      error
    );
  }
};

/* =====================================================
   UPDATE USER STATUS

   PATCH /api/admin/users/:userId/status

   Controls account login access,
   not affiliate earning status.
===================================================== */

export const updateUserStatus = async (
  req,
  res
) => {
  try {
    const { userId } =
      req.params;

    const {
      status,
      reason,
    } = req.body || {};

    if (!validId(userId)) {
      return fail(
        res,
        400,
        "Invalid user ID"
      );
    }

    if (
      !STATUSES.includes(status)
    ) {
      return fail(
        res,
        400,
        "Invalid account status"
      );
    }

    if (
      reason !== undefined &&
      (
        typeof reason !== "string" ||
        reason.length > 500
      )
    ) {
      return fail(
        res,
        400,
        "Invalid status reason"
      );
    }

    if (
      String(actorId(req)) ===
      String(userId)
    ) {
      return fail(
        res,
        403,
        "Cannot change your own account status"
      );
    }

    const current =
      await User.findOne({
        _id: userId,
        isDeleted: false,
      });

    if (!current) {
      return fail(
        res,
        404,
        "User not found"
      );
    }

    if (
      current.status === status
    ) {
      return fail(
        res,
        400,
        `Account is already ${status}`
      );
    }

    const user =
      await changeAccountSecurityState({
        userId,

        actorId:
          actorId(req),

        update: {
          status,

          statusReason:
            reason?.trim() || null,

          statusChangedAt:
            new Date(),

          statusChangedBy:
            actorId(req),

          updatedBy:
            actorId(req),
        },

        reason:
          `Account status changed to ${status}`,
      });

    await audit({
      req,
      user: userId,
      actor: actorId(req),

      action:
        "ACCOUNT_STATUS_CHANGED",

      metadata: {
        previousStatus:
          current.status,

        newStatus:
          status,

        reason:
          reason?.trim() || null,
      },
    });

    return res.json({
      success: true,

      message:
        `Account status changed to ${status}`,

      user: safe(user),
    });
  } catch (error) {
    return handleError(
      res,
      error
    );
  }
};

/* =====================================================
   UPDATE AFFILIATE STATUS

   PATCH /api/admin/users/:userId/affiliate/status

   Affiliate status is separate from
   User.status.

   Inactive affiliate:
   - May still log in.
   - Cannot earn on new referrals.
===================================================== */

export const updateAffiliateStatus = async (
  req,
  res
) => {
  try {
    const { userId } =
      req.params;

    const { status } =
      req.body || {};

    if (!validId(userId)) {
      return fail(
        res,
        400,
        "Invalid user ID"
      );
    }

    if (
      !AFFILIATE_STATUSES.includes(
        status
      )
    ) {
      return fail(
        res,
        400,
        "Invalid affiliate status"
      );
    }

    const user =
      await User.findOne({
        _id: userId,
        role: "affiliate",
        isDeleted: false,
      });

    if (!user) {
      return fail(
        res,
        404,
        "Affiliate not found"
      );
    }

    if (!user.affiliate) {
      return fail(
        res,
        400,
        "Affiliate configuration is missing"
      );
    }

    const previousStatus =
      user.affiliate.status;

    if (
      previousStatus === status
    ) {
      return res.json({
        success: true,
        message:
          `Affiliate is already ${status}`,
        user: safe(user),
      });
    }

    user.affiliate.status =
      status;

    user.updatedBy =
      actorId(req);

    await user.save();

    await audit({
      req,
      user: userId,
      actor: actorId(req),

      action:
        "AFFILIATE_STATUS_CHANGED",

      metadata: {
        previousStatus,
        newStatus: status,
      },
    });

    return res.json({
      success: true,

      message:
        `Affiliate status changed to ${status}`,

      user: safe(user),
    });
  } catch (error) {
    return handleError(
      res,
      error
    );
  }
};

/* =====================================================
   SOFT DELETE USER

   DELETE /api/admin/users/:userId
===================================================== */

export const deleteUser = async (
  req,
  res
) => {
  try {
    const { userId } =
      req.params;

    if (!validId(userId)) {
      return fail(
        res,
        400,
        "Invalid user ID"
      );
    }

    if (
      String(actorId(req)) ===
      String(userId)
    ) {
      return fail(
        res,
        403,
        "Cannot delete your own account"
      );
    }

    const current =
      await User.findOne({
        _id: userId,
        isDeleted: false,
      });

    if (!current) {
      return fail(
        res,
        404,
        "User not found"
      );
    }

    await changeAccountSecurityState({
      userId,

      actorId:
        actorId(req),

      update: {
        isDeleted: true,

        deletedAt:
          new Date(),

        deletedBy:
          actorId(req),

        status:
          "inactive",

        updatedBy:
          actorId(req),
      },

      reason:
        "Account deleted by administrator",
    });

    await audit({
      req,
      user: userId,
      actor: actorId(req),

      action:
        "ACCOUNT_DELETED",
    });

    return res.json({
      success: true,

      message:
        "User deleted and all sessions revoked",
    });
  } catch (error) {
    return handleError(
      res,
      error
    );
  }
};

/* =====================================================
   SEND PASSWORD SETUP / RESET LINK

   POST /api/admin/users/:userId/password-link
===================================================== */

export const sendPasswordLink = async (
  req,
  res
) => {
  try {
    const { userId } =
      req.params;

    if (!validId(userId)) {
      return fail(
        res,
        400,
        "Invalid user ID"
      );
    }

    const user =
      await User.findOne({
        _id: userId,
        isDeleted: false,
      });

    if (!user) {
      return fail(
        res,
        404,
        "User not found"
      );
    }

    const purpose =
      user.mustChangePassword
        ? "setup"
        : "reset";

    // Revoke previously issued but
    // unused password links.
    await UserSession.updateMany(
      {
        user: userId,
        state: "pending_setup",
      },
      {
        $set: {
          state: "revoked",
          revokedAt: new Date(),
          challengeHash: null,
        },
      }
    );

    const {
      token,
      session,
    } = await createPasswordChallenge(
      req,
      user,
      purpose
    );

    try {
      await sendPasswordSetupEmail(
        user,
        token,
        purpose
      );
    } catch (mailError) {
      await UserSession.deleteOne({
        _id: session._id,
      }).catch(console.error);

      throw mailError;
    }

    await audit({
      req,
      user: userId,
      actor: actorId(req),

      action:
        "PASSWORD_LINK_SENT",

      metadata: {
        purpose,
      },
    });

    return res.json({
      success: true,

      message:
        "Password setup/reset link sent successfully",
    });
  } catch (error) {
    return handleError(
      res,
      error
    );
  }
};

/* =====================================================
   ADMIN LOGOUT ALL DEVICES

   POST /api/admin/users/:userId/logout-all
===================================================== */

export const adminRevokeAll = async (
  req,
  res
) => {
  try {
    const { userId } =
      req.params;

    if (!validId(userId)) {
      return fail(
        res,
        400,
        "Invalid user ID"
      );
    }

    const current =
      await User.findById(
        userId
      );

    if (
      !current ||
      current.isDeleted
    ) {
      return fail(
        res,
        404,
        "User not found"
      );
    }

    const user =
      await changeAccountSecurityState({
        userId,

        actorId:
          actorId(req),

        update: {
          updatedBy:
            actorId(req),
        },

        reason:
          "Admin revoked all sessions",
      });

    await audit({
      req,
      user: userId,
      actor: actorId(req),

      action:
        "ALL_SESSIONS_REVOKED",
    });

    return res.json({
      success: true,

      message:
        "All devices logged out",

      userId:
        String(user._id),
    });
  } catch (error) {
    return handleError(
      res,
      error
    );
  }
};

/* =====================================================
   CHANGE OWN PASSWORD

   POST /api/auth/change-password

   All authenticated roles:
   admin
   Employee
   normal
   affiliate

   Request:
   {
     "oldPassword": "...",
     "newPassword": "...",
     "confirmPassword": "..."
   }

   On success, all sessions are revoked.
===================================================== */

export const changeMyPassword = async (
  req,
  res
) => {
  try {
    const userId =
      actorId(req);

    if (
      !userId ||
      !validId(userId)
    ) {
      return fail(
        res,
        401,
        "Authentication required"
      );
    }

    const {
      oldPassword,
      newPassword,
      confirmPassword,
    } = req.body || {};

    /* =========================================
       VALIDATE REQUEST
    ========================================= */

    if (
      typeof oldPassword !== "string" ||
      !oldPassword
    ) {
      return fail(
        res,
        400,
        "Current password is required"
      );
    }

    if (
      typeof newPassword !== "string" ||
      typeof confirmPassword !== "string"
    ) {
      return fail(
        res,
        400,
        "New password and confirmation are required"
      );
    }

    if (
      newPassword !== confirmPassword
    ) {
      return fail(
        res,
        400,
        "New password and confirmation do not match"
      );
    }

    /* =========================================
       PASSWORD STRENGTH

       8–128 characters.
       Uppercase, lowercase, number,
       special character.
    ========================================= */

    if (
      newPassword.length < 8 ||
      newPassword.length > 128
    ) {
      return fail(
        res,
        400,
        "New password must contain 8–128 characters"
      );
    }

    if (
      !/[A-Z]/.test(newPassword) ||
      !/[a-z]/.test(newPassword) ||
      !/[0-9]/.test(newPassword) ||
      !/[^A-Za-z0-9]/.test(newPassword)
    ) {
      return fail(
        res,
        400,
        "Password must contain uppercase, lowercase, number and special character"
      );
    }

    if (
      oldPassword === newPassword
    ) {
      return fail(
        res,
        400,
        "New password must be different from the current password"
      );
    }

    /* =========================================
       LOAD PASSWORD HASH

       password is select:false in schema.
       Explicit selection is required.
    ========================================= */

    const user =
      await User.findOne({
        _id: userId,
        status: "active",
        isDeleted: false,
      }).select(
        "+password +tokenVersion"
      );

    if (!user) {
      return fail(
        res,
        401,
        "Account unavailable"
      );
    }

    if (
      user.mustChangePassword
    ) {
      return fail(
        res,
        403,
        "Complete your initial password setup first"
      );
    }

    if (
      !user.password
    ) {
      return fail(
        res,
        400,
        "Password is not configured for this account"
      );
    }

    /* =========================================
       VERIFY CURRENT PASSWORD
    ========================================= */

    const isValid =
      await bcrypt.compare(
        oldPassword,
        user.password
      );

    if (!isValid) {
      await audit({
        req,
        user: user._id,
        actor: user._id,

        action:
          "PASSWORD_CHANGE_FAILED",

        result: "failure",

        metadata: {
          reason:
            "Incorrect current password",
        },
      });

      return fail(
        res,
        401,
        "Current password is incorrect"
      );
    }

    /* =========================================
       ENSURE NEW PASSWORD IS DIFFERENT
    ========================================= */

    const samePassword =
      await bcrypt.compare(
        newPassword,
        user.password
      );

    if (samePassword) {
      return fail(
        res,
        400,
        "New password must be different from the current password"
      );
    }

    /* =========================================
       HASH NEW PASSWORD
    ========================================= */

    const newHash =
      await hashPassword(
        newPassword
      );

    /* =========================================
       SAVE + INVALIDATE SESSIONS

       Reuses the existing security service
       to increment tokenVersion and revoke
       MongoDB/Redis sessions.
    ========================================= */

    await changeAccountSecurityState({
      userId:
        String(user._id),

      actorId:
        String(user._id),

      update: {
        password:
          newHash,

        passwordChangedAt:
          new Date(),

        mustChangePassword:
          false,

        failedLoginAttempts:
          0,

        lockedUntil:
          null,

        updatedBy:
          user._id,
      },

      reason:
        "User changed account password",
    });

    /* =========================================
       INVALIDATE OUTSTANDING SETUP LINKS
    ========================================= */

    await UserSession.updateMany(
      {
        user: user._id,
        state: "pending_setup",
      },
      {
        $set: {
          state: "revoked",
          revokedAt: new Date(),
          challengeHash: null,
        },
      }
    );

    /* =========================================
       AUDIT
    ========================================= */

    await audit({
      req,
      user: user._id,
      actor: user._id,

      action:
        "PASSWORD_CHANGED",

      metadata: {
        allSessionsRevoked: true,
      },
    });

    return res.json({
      success: true,

      requiresRelogin: true,

      message:
        "Password changed successfully. Please sign in again.",
    });
  } catch (error) {
    return handleError(
      res,
      error
    );
  }
};
