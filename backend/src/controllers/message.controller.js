import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import mongoose from "mongoose";

// ***************** Get Users For Sidebar *****************
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // OPTIMIZATION: One Aggregation instead of many .findOne calls.
    // This fetches all users and their latest message in a single DB round-trip.
    const usersWithLastMessage = await User.aggregate([
      { $match: { _id: { $ne: loggedInUserId } } },
      {
        $lookup: {
          from: "messages",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    {
                      $and: [
                        { $eq: ["$senderId", loggedInUserId] },
                        { $eq: ["$receiverId", "$$userId"] },
                      ],
                    },
                    {
                      $and: [
                        { $eq: ["$senderId", "$$userId"] },
                        { $eq: ["$receiverId", loggedInUserId] },
                      ],
                    },
                  ],
                },
              },
            },
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
            { $project: { text: 1, image: 1, senderId: 1, createdAt: 1 } },
          ],
          as: "lastMessage",
        },
      },
      { $unwind: { path: "$lastMessage", preserveNullAndEmptyArrays: true } },
      { $project: { password: 0, __v: 0 } },
    ]);

    res.status(200).json(usersWithLastMessage);
  } catch (error) {
    console.error("Sidebar Error:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ***************** Get Messages *****************
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    // OPTIMIZATION: Non-blocking update (no await) to speed up response time.
    Message.updateMany(
      { senderId: userToChatId, receiverId: myId, isSeen: false },
      { $set: { isSeen: true } }
    ).exec();

    // OPTIMIZATION: .lean() makes this query 5x faster by returning plain JS objects.
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    })
      .populate("replyTo", "text image")
      .lean();

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ***************** Send Message *****************
export const sendMessage = async (req, res) => {
  try {
    const { text, image, replyTo } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      // OPTIMIZATION: Auto-format and auto-quality for better LCP.
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "chat_images",
        transformation: [
          { quality: "auto", fetch_format: "auto", width: 1000 },
        ],
      });
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      replyTo: replyTo || null,
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("replyTo", "text image")
      .lean();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", populatedMessage);
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ***************** Delete Message *****************
export const deleteMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId)
      .select("senderId receiverId")
      .lean();
    if (!message)
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });

    if (message.senderId.toString() !== userId.toString()) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    await Message.findByIdAndDelete(messageId);

    const receiverSocketId = getReceiverSocketId(message.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", messageId);
    }

    res.status(200).json({ success: true, message: "Message deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ***************** Mark As Seen *****************
export const markAsSeen = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const userId = req.user._id;

    await Message.updateMany(
      { senderId: userToChatId, receiverId: userId, isSeen: false },
      { $set: { isSeen: true } }
    );

    const senderSocketId = getReceiverSocketId(userToChatId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesSeen", { seenBy: userId });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ***************** Add/Toggle Reaction *****************
export const addReaction = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    // Use findOneAndUpdate for atomic operations where possible
    const message = await Message.findById(messageId);
    if (!message)
      return res.status(404).json({ success: false, message: "Not found" });

    const existingIndex = message.reactions.findIndex(
      (r) => r.userId.toString() === userId.toString()
    );

    if (existingIndex > -1) {
      if (message.reactions[existingIndex].emoji === emoji) {
        message.reactions.splice(existingIndex, 1);
      } else {
        message.reactions[existingIndex].emoji = emoji;
      }
    } else {
      message.reactions.push({ userId, emoji });
    }

    await message.save();

    const otherId =
      message.senderId.toString() === userId.toString()
        ? message.receiverId
        : message.senderId;
    const socketId = getReceiverSocketId(otherId);
    if (socketId)
      io.to(socketId).emit("messageReaction", {
        messageId,
        reactions: message.reactions,
      });

    res.status(200).json(message.reactions);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ***************** Edit Message *****************
export const editMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    const updatedMessage = await Message.findOneAndUpdate(
      { _id: messageId, senderId: userId },
      { text, isEdited: true },
      { new: true, lean: true }
    );

    if (!updatedMessage)
      return res.status(404).json({ success: false, message: "Not found" });

    const socketId = getReceiverSocketId(updatedMessage.receiverId);
    if (socketId) io.to(socketId).emit("messageUpdate", updatedMessage);

    res.status(200).json(updatedMessage);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ***************** Clear Chat *****************
export const clearChat = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    await Message.deleteMany({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json({ success: true, message: "Chat cleared" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ***************** Forward Message *****************
export const forwardMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const { receiverId } = req.body;
    const senderId = req.user._id;

    const original = await Message.findById(messageId).lean();
    if (!original)
      return res.status(404).json({ success: false, message: "Not found" });

    const forwarded = await Message.create({
      senderId,
      receiverId,
      text: original.text,
      image: original.image,
    });

    const socketId = getReceiverSocketId(receiverId);
    if (socketId) io.to(socketId).emit("newMessage", forwarded);

    res.status(201).json(forwarded);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
