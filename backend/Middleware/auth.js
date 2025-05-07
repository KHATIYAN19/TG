import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1] || req.cookies.token;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token missing"
      });
    }
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decode;
    } catch (error) {
      console.log(error);
      return res.status(401).json({
        success: false,
        message: "token invalid"
      });
    }
    next();
  } catch (e) {
    return res.status(401).json({
      message: "something worng went wrong",
      success: false
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
