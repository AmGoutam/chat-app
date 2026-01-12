import express from "express";
import rateLimit from "express-rate-limit"; // Optimization: Prevent spam
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  addReaction,
  clearChat,
  deleteMessage,
  editMessage,
  forwardMessage,
  getMessages,
  getUsersForSidebar,
  markAsSeen,
  sendMessage,
} from "../controllers/message.controller.js";

const router = express.Router();

const messageLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 messages per minute
  message: "Too many messages sent from this IP, please try again later.",
});

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, messageLimiter, sendMessage);
router.post("/forward/:id", protectRoute, messageLimiter, forwardMessage);

router.put("/seen/:id", protectRoute, markAsSeen);
router.post("/react/:id", protectRoute, addReaction);

router.put("/edit/:id", protectRoute, editMessage);
router.delete("/delete/:id", protectRoute, deleteMessage);
router.delete("/clear/:id", protectRoute, clearChat);

export default router;
