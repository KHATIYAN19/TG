import jwt from "jsonwebtoken";


export const auth = (req, res, next) => {
  try {
    let token;
    if (req.header("Authorization")) {
      token = req.header("Authorization").split(" ")[1];
    } 
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token missing."
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: "Authentication token has expired. Please log in again."
        });
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: "Invalid authentication token."
        });
      }
      console.error("JWT verification error:", error);
      return res.status(401).json({
        success: false,
        message: "Authentication token is invalid or malformed."
      });
    }
  } catch (err) {
    console.error("Authentication middleware error:", err);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred during authentication."
    });
  }
};

export const isAdmin = (req, res, next) => {
  try {
   
    if (req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: "Only Admin can perform this action"
      });
    }
    next();
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "User role not found"
    });
  }
};

export const isEmployee = (req, res, next) => {
  try {
    if (req.user.role !== 'Employee') {
      return res.status(401).json({
        success: false,
        message: "Only Employee can perform this action"
      });
    }
    next();
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "User role not found"
    });
  }
};

export const isUser = (req, res, next) => {
  try {
  
    if (req.user.role !== 'Employee'&&req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: "Only admins can perform this action"
      });
    }
    next();
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "User role not found"
    });
  }
};