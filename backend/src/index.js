import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import compression from "compression"; 
import helmet from "helmet";
import rateLimit from "express-rate-limit"; // New: Prevents server overload

import connectDb from "./db/db.js";
import { app, server } from "./lib/socket.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";

dotenv.config();

const PORT = process.env.PORT || 8000;
const isProd = process.env.NODE_ENV === "production";

// --- 1. RATE LIMITING ---
// Optimization: Limits each IP to 100 requests per 15 mins to preserve server resources.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all requests
app.use(limiter);

// --- 2. PERFORMANCE & SECURITY ---
app.use(compression()); // Shrinks JSON payloads
app.use(helmet());      // Hardens server security

// --- 3. REQUEST PARSING ---
// Strict limits to prevent memory spikes
app.use(express.json({ limit: "2mb" })); 
app.use(express.urlencoded({ limit: "2mb", extended: true }));
app.use(cookieParser());

// --- 4. PRODUCTION CORS ---
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// --- 5. ROUTES ---
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// --- 6. GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: !isProd ? err.stack : undefined, // Hide stack in production
  });
});

// --- 7. INITIALIZATION ---
// Connect to DB before server start to avoid initial request failures.
server.listen(PORT, async () => {
  try {
    await connectDb();
    console.log(`🚀 Production Server: Port ${PORT}`);
  } catch (error) {
    console.error("❌ Initialization Failed:", error.message);
    process.exit(1);
  }
});