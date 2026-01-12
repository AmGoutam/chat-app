import { Server } from "socket.io";
import http from "http";
import express from "express";
import User from "../models/user.model.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

export const getReceiverSocketId = (userId) => userSocketMap[userId];

const userSocketMap = {}; 

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  
  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
    io.volatile.emit("getOnlineUsers", Object.keys(userSocketMap));
  }

  // --- TYPING EVENTS (Optimized with volatile) ---
  socket.on("typing", ({ senderId, receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).volatile.emit("userTyping", { senderId });
    }
  });

  socket.on("stopTyping", ({ senderId, receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).volatile.emit("userStoppedTyping", { senderId });
    }
  });

  socket.on("disconnect", async () => {
    if (userId && userId !== "undefined") {
      const lastSeen = new Date();
      
      delete userSocketMap[userId];
      
      io.emit("userOffline", { userId, lastSeen });
      io.emit("getOnlineUsers", Object.keys(userSocketMap));


      User.findByIdAndUpdate(userId, { lastSeen }).exec().catch(err => 
        console.error("Delayed lastSeen update failed", err)
      );
    }
  });
});

export { io, app, server };