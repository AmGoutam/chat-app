import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";

import connectDb from "./db/db.js";
import { app, server } from "./lib/socket.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";

dotenv.config();

const PORT = process.env.PORT || 8000;
const isProd = process.env.NODE_ENV === "production";
const __dirname = path.resolve();

// --- 1. PROXY TRUST (MUST BE BEFORE LIMITER) ---
// Essential for Render/proxies so rate limiting correctly identifies users.
app.set("trust proxy", 1); 

// --- 2. PERFORMANCE & SECURITY MIDDLEWARE ---
app.use(compression()); // Shrinks JSON payloads for faster delivery.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "'unsafe-inline'"],
        "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        "img-src": ["'self'", "data:", "https://res.cloudinary.com"],
        "connect-src": [
          "'self'",
          "https://chat-app-yfj9.onrender.com",
          "wss://chat-app-yfj9.onrender.com",
        ],
      },
    },
  })
);

// --- 3. RATE LIMITING ---
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// --- 4. REQUEST PARSING ---
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ limit: "2mb", extended: true }));
app.use(cookieParser());

// --- 5. CORS CONFIGURATION ---
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// --- 6. API ROUTES ---
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// --- 7. STATIC FILE SERVING & CATCH-ALL ---
if (isProd) {
  const distPath = path.join(__dirname, "frontend", "dist");
  app.use(express.static(distPath));

  // Express v5 requires a named parameter for wildcards.
  app.get("/*splat", (req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

// --- 8. ERROR HANDLING (LAST) ---
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: !isProd ? err.stack : undefined,
  });
});

// --- 9. START SERVER ---
server.listen(PORT, async () => {
  try {
    await connectDb();
    console.log(`🚀 Production Server: Port ${PORT}`);
  } catch (error) {
    console.error("❌ Initialization Failed:", error.message);
    process.exit(1);
  }
});