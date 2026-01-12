import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { removeMessage } from "../slices/chatSlice";
import toast from "react-hot-toast";

/**
 * 1. Get all users
 * OPTIMIZATION: Implemented conditional fetching.
 * If users already exist in state, skip the network request to save bandwidth.
 */
export const getUsers = createAsyncThunk("chat/getUsers", async (_, { getState, rejectWithValue }) => {
  const { users } = getState().chat;
  if (users.length > 0) return users; // Return cached data if available

  try {
    const res = await axiosInstance.get("/messages/users");
    return res.data;
  } catch (error) {
    const message = error.response?.data?.message || "Failed to load users";
    toast.error(message);
    return rejectWithValue(message);
  }
});

/**
 * 2. Get message history
 * OPTIMIZATION: Signal-based cancellation.
 * If the user clicks multiple contacts quickly, old requests are cancelled
 * to prevent the UI from flickering with old data.
 */
export const getMessages = createAsyncThunk(
  "chat/getMessages", 
  async (userId, { rejectWithValue, signal }) => {
    try {
      const res = await axiosInstance.get(`/messages/${userId}`, { signal });
      return res.data;
    } catch (error) {
      if (error.name === 'CanceledError') return; // Ignore cancellations
      const message = error.response?.data?.message || "Failed to load messages";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// 3. Send a new message
export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (messageData, { getState, rejectWithValue }) => {
    try {
      const { chat } = getState();
      const res = await axiosInstance.post(`/messages/send/${chat.selectedUser._id}`, messageData);
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to send message";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

/**
 * 4. Delete a message
 * OPTIMIZATION: Optimistic updates handled in Slice.
 */
export const deleteMessageThunk = createAsyncThunk(
  "chat/deleteMessage",
  async (messageId, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/messages/delete/${messageId}`);
      // Remove from UI immediately via slice
      dispatch(removeMessage(messageId));
      toast.success("Message deleted");
      return messageId;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete message";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

/**
 * 5. Mark messages as seen
 * OPTIMIZATION: Background execution.
 * This is a "fire and forget" action that shouldn't block UI state.
 */
export const markAsSeenThunk = createAsyncThunk(
  "chat/markAsSeen",
  async (userId) => {
    try {
      await axiosInstance.put(`/messages/seen/${userId}`);
      return userId;
    } catch (e) {
      return userId; // Silent fail in background
    }
  }
);

// 6. Forward a message
export const forwardMessageThunk = createAsyncThunk(
  "chat/forwardMessage",
  async ({ messageId, receiverId }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`/messages/forward/${messageId}`, { receiverId });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to forward");
    }
  }
);

// 7. Edit message
export const editMessageThunk = createAsyncThunk(
  "chat/editMessage",
  async ({ messageId, text, image }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/messages/edit/${messageId}`, { text, image });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to edit");
    }
  }
);

// 8. Clear chat
export const clearChatThunk = createAsyncThunk(
  "chat/clearChat",
  async (userId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/messages/clear/${userId}`);
      toast.success("Chat cleared");
      return userId;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to clear chat";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);