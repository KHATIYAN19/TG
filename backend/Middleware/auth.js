// import jwt from "jsonwebtoken";


// export const auth = (req, res, next) => {
//   try {
//     let token;
//     if (req.header("Authorization")) {
//       token = req.header("Authorization").split(" ")[1];
//     } 
//     else if (req.cookies && req.cookies.token) {
//       token = req.cookies.token;
//     }

//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: "Authentication token missing."
//       });
//     }

//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       req.user = decoded;
//       next();
//     } catch (error) {
//       if (error.name === 'TokenExpiredError') {
//         return res.status(401).json({
//           success: false,
//           message: "Authentication token has expired. Please log in again."
//         });
//       }
//       if (error.name === 'JsonWebTokenError') {
//         return res.status(401).json({
//           success: false,
//           message: "Invalid authentication token."
//         });
//       }
//       console.error("JWT verification error:", error);
//       return res.status(401).json({
//         success: false,
//         message: "Authentication token is invalid or malformed."
//       });
//     }
//   } catch (err) {
//     console.error("Authentication middleware error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "An unexpected error occurred during authentication."
//     });
//   }
// };

// export const isAdmin = (req, res, next) => {
//   try {
   
//     if (req.user.role !== 'admin') {
//       return res.status(401).json({
//         success: false,
//         message: "Only Admin can perform this action"
//       });
//     }
//     next();
//   } catch (e) {
//     return res.status(500).json({
//       success: false,
//       message: "User role not found"
//     });
//   }
// };

// export const isEmployee = (req, res, next) => {
//   try {
//     if (req.user.role !== 'Employee') {
//       return res.status(401).json({
//         success: false,
//         message: "Only Employee can perform this action"
//       });
//     }
//     next();
//   } catch (e) {
//     return res.status(500).json({
//       success: false,
//       message: "User role not found"
//     });
//   }
// };

// export const isUser = (req, res, next) => {
//   try {
  
//     if (req.user.role !== 'Employee'&&req.user.role !== 'admin') {
//       return res.status(401).json({
//         success: false,
//         message: "Only admins can perform this action"
//       });
//     }
//     next();
//   } catch (e) {
//     return res.status(500).json({
//       success: false,
//       message: "User role not found"
//     });
//   }
// };


import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import redis from "../utils/redis.js";

/* ==============================================
   HELPERS
============================================== */

const errorResponse = (res, status, message, code) => {
  return res.status(status).json({
    success: false,
    message,
    code,
  });
};

export const authRedisKeys = {
  user: (id) => `auth:user:${id}`,
  session: (id) => `auth:session:${id}`,
};

/* ==============================================
   AUTHENTICATION
============================================== */

export const auth = async (req, res, next) => {
  try {
    /* ===== 1. EXTRACT JWT ===== */

    const authorization = req.get("Authorization");

    let token = null;

    if (authorization) {
      const match = authorization.match(/^Bearer\s+(\S+)$/i);

      if (!match) {
        return errorResponse(
          res, 401,
          "Invalid Authorization header.",
          "INVALID_AUTH_HEADER"
        );
      }

      token = match[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return errorResponse(
        res, 401,
        "Authentication token missing.",
        "TOKEN_MISSING"
      );
    }

    /* ===== 2. VERIFY JWT LOCALLY ===== */

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET,
        {
          algorithms: ["HS256"],
        }
      );
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return errorResponse(
          res, 401,
          "Authentication token expired.",
          "TOKEN_EXPIRED"
        );
      }

      return errorResponse(
        res, 401,
        "Invalid authentication token.",
        "INVALID_TOKEN"
      );
    }

    /* ===== 3. VALIDATE PAYLOAD ===== */

    const userId = decoded.sub;
    const sessionId = decoded.sid;
    const tokenVersion = decoded.tv;

    if (
      typeof userId !== "string" ||
      !mongoose.isValidObjectId(userId) ||
      typeof sessionId !== "string" ||
      !sessionId ||
      !Number.isSafeInteger(tokenVersion) ||
      tokenVersion < 0
    ) {
      return errorResponse(
        res, 401,
        "Invalid token payload.",
        "INVALID_TOKEN_PAYLOAD"
      );
    }

    /* ===== 4. CHECK REDIS ===== */

    const [userAuth, sessionAuth] = await redis.mget(
      authRedisKeys.user(userId),
      authRedisKeys.session(sessionId)
    );

    // Missing Redis authentication state is NOT
    // interpreted as permission to authenticate.
    if (!userAuth || !sessionAuth) {
      return errorResponse(
        res, 401,
        "Session not found. Please log in again.",
        "SESSION_NOT_FOUND"
      );
    }

    /* ===== 5. VALIDATE USER ===== */

    if (userAuth.isDeleted === true) {
      return errorResponse(
        res, 403,
        "Account has been deleted.",
        "ACCOUNT_DELETED"
      );
    }

    if (userAuth.status !== "active") {
      return errorResponse(
        res, 403,
        "Your account is not active.",
        "ACCOUNT_DISABLED"
      );
    }

    if (
      userAuth.lockedUntil &&
      Number(userAuth.lockedUntil) > Date.now()
    ) {
      return errorResponse(
        res, 403,
        "Account temporarily locked.",
        "ACCOUNT_LOCKED"
      );
    }

    if (userAuth.mustChangePassword !== false) {
      return errorResponse(
        res, 403,
        "Complete password setup.",
        "PASSWORD_SETUP_REQUIRED"
      );
    }

    /* ===== 6. CHECK TOKEN VERSION ===== */

    if (
      !Number.isSafeInteger(userAuth.tokenVersion) ||
      userAuth.tokenVersion !== tokenVersion
    ) {
      return errorResponse(
        res, 401,
        "Token revoked. Please log in again.",
        "TOKEN_REVOKED"
      );
    }

    /* ===== 7. VALIDATE DEVICE SESSION ===== */

    if (
      sessionAuth.userId !== userId ||
      sessionAuth.tokenVersion !== tokenVersion ||
      sessionAuth.state !== "active" ||
      !Number.isFinite(sessionAuth.expiresAt) ||
      sessionAuth.expiresAt <= Date.now()
    ) {
      return errorResponse(
        res, 401,
        "Device session expired or revoked.",
        "SESSION_REVOKED"
      );
    }

    /* ===== 8. VALIDATE ROLE ===== */

    const allowedRoles = [
      "admin",
      "Employee",
      "normal",
      "affiliate"
    ];

    if (!allowedRoles.includes(userAuth.role)) {
      return errorResponse(
        res, 403,
        "Invalid user role.",
        "INVALID_ROLE"
      );
    }

    /* ===== 9. ATTACH USER TO REQUEST ===== */

    req.user = {
      _id: userId,
      id: userId,
      userId,
      role: userAuth.role,
    };

    req.authSession = {
      sessionId,
      user: userId,
      state: "active",
    };

    req.sessionId = sessionId;
    req.tokenPayload = decoded;

    return next();

  } catch (error) {
    console.error("Redis authentication error:", error);

    // FAIL CLOSED.
    // Never authorize a request if Redis is unavailable.
    return errorResponse(
      res, 503,
      "Authentication temporarily unavailable.",
      "AUTH_SERVICE_UNAVAILABLE"
    );
  }
};

/* ==============================================
   ADMIN ONLY
============================================== */

export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return errorResponse(
      res, 401,
      "Authentication required.",
      "UNAUTHORIZED"
    );
  }

  if (req.user.role !== "admin") {
    return errorResponse(
      res, 403,
      "Only Admin can perform this action.",
      "FORBIDDEN"
    );
  }

  next();
};

/* ==============================================
   EMPLOYEE ONLY
============================================== */

export const isEmployee = (req, res, next) => {
  if (!req.user) {
    return errorResponse(
      res, 401,
      "Authentication required.",
      "UNAUTHORIZED"
    );
  }

  if (req.user.role !== "Employee") {
    return errorResponse(
      res, 403,
      "Only Employee can perform this action.",
      "FORBIDDEN"
    );
  }

  next();
};

/* ==============================================
   ADMIN OR EMPLOYEE
============================================== */

export const isUser = (req, res, next) => {
  if (!req.user) {
    return errorResponse(
      res, 401,
      "Authentication required.",
      "UNAUTHORIZED"
    );
  }

  if (
    req.user.role !== "admin" &&
    req.user.role !== "Employee"
  ) {
    return errorResponse(
      res, 403,
      "Only Admin or Employee can perform this action.",
      "FORBIDDEN"
    );
  }

  next();
};


export const isAffiliate = (req, res, next) => {
  if (!req.user) {
    return errorResponse(
      res, 401,
      "Authentication required.",
      "UNAUTHORIZED"
    );
  }

  if (req.user.role !== "affiliate") {
    return errorResponse(
      res, 403,
      "Only Affiliate can perform this action.",
      "FORBIDDEN"
    );
  }

  next();
};
/* ==============================================
   DYNAMIC ROLE AUTHORIZATION
============================================== */

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(
        res, 401,
        "Authentication required.",
        "UNAUTHORIZED"
      );
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res, 403,
        "Insufficient permissions.",
        "FORBIDDEN"
      );
    }

    next();
  };
};
