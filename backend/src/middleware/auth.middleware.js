import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized - No Token Provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: "Unauthorized - Invalid or Expired Token" });
    }

    const user = await User.findById(decoded.userId).select("_id fullName profilePic");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    req.user = user;
    
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};