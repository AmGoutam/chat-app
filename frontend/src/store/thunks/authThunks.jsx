import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

// Use environment variable for production readiness
const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:8000" : "/"; 

// --- OPTIMIZATION: Singleton Socket Management ---
// Keeping the socket instance outside of Redux prevents "non-serializable" errors
// and major performance drops during state updates.
let socket = null;

export const getSocket = () => socket;

const connectSocket = (user) => {
  if (!user || socket?.connected) return;

  socket = io(BASE_URL, {
    query: { userId: user._id },
    transports: ["websocket"], // Optimization: force WebSocket to avoid polling overhead
  });

  socket.connect();
};

const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// 1. Check Auth (Runs on app initialization)
export const checkAuth = createAsyncThunk("auth/check", async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get("/auth/check");
    // Connect socket logic kept outside Redux dispatch for speed
    connectSocket(res.data);
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Session expired");
  }
});

// 2. Signup Thunk
export const signup = createAsyncThunk("auth/signup", async (data, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post("/auth/signup", data);
    toast.success("Account created successfully!");
    connectSocket(res.data);
    return res.data;
  } catch (error) {
    const message = error.response?.data?.message || "Signup failed";
    toast.error(message);
    return rejectWithValue(message);
  }
});

// 3. Login Thunk
export const login = createAsyncThunk("auth/login", async (data, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post("/auth/login", data);
    toast.success("Welcome back!");
    connectSocket(res.data);
    return res.data;
  } catch (error) {
    const message = error.response?.data?.message || "Invalid credentials";
    toast.error(message);
    return rejectWithValue(message);
  }
});

// 4. Update Profile
export const updateProfile = createAsyncThunk(
  "auth/update-profile",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      toast.success("Profile updated successfully!");
      return res.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to update profile";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// 5. Logout
export const logout = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    // Optimization: Immediate disconnect to free up browser resources
    disconnectSocket();
    await axiosInstance.post("/auth/logout");
    toast.success("Logged out successfully");
    return null;
  } catch (error) {
    const message = error.response?.data?.message || "Logout failed";
    toast.error(message);
    return rejectWithValue(message);
  }
});