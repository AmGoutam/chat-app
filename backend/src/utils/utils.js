import jwt from "jsonwebtoken";


const generateToken = (userId, res) => {
  // OPTIMIZATION: Use a standardized expiry time
  const expiresIn = process.env.JWT_EXPIRESIN || "7d";
  
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: expiresIn,
  });

  // Calculate maxAge in MS (e.g., 7 days)
  const maxAge = 7 * 24 * 60 * 60 * 1000;

  res.cookie("jwt", token, {
    maxAge: maxAge, 
    httpOnly: true, // OPTIMIZATION: Prevents XSS attacks
    sameSite: "strict", // OPTIMIZATION: Prevents CSRF attacks
    secure: process.env.NODE_ENV === "production", // Only send over HTTPS in prod
    path: "/", // Ensures cookie is accessible across the entire app
  });

  return token;
};

export default generateToken;