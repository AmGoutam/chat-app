import { createSlice } from "@reduxjs/toolkit";
import { checkAuth, signup, login, updateProfile, logout } from "../thunks/authThunks";

/**
 * authSlice: Manages user authentication and online status.
 * OPTIMIZATION: Removed 'socket' from state. Redux should only hold serializable data.
 * The socket instance should be managed in a singleton file or a context provider.
 */
const authSlice = createSlice({
  name: "auth",
  initialState: {
    authUser: null,
    isCheckingAuth: true,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    onlineUsers: [], // Only IDs (Strings), which is highly performant
  },
  reducers: {
    // We only store the online users list here
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    // Synchronous cleanup for immediate UI feedback
    logoutUser: (state) => {
      state.authUser = null;
      state.onlineUsers = [];
    },
  },
  extraReducers: (builder) => {
    builder
      /* --- Check Auth --- */
      .addCase(checkAuth.pending, (state) => {
        state.isCheckingAuth = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        // Only update if data actually changed to prevent unnecessary re-renders
        state.authUser = action.payload;
        state.isCheckingAuth = false;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.authUser = null;
        state.isCheckingAuth = false;
      })

      /* --- Signup --- */
      .addCase(signup.pending, (state) => {
        state.isSigningUp = true;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.authUser = action.payload;
        state.isSigningUp = false;
      })
      .addCase(signup.rejected, (state) => {
        state.isSigningUp = false;
      })

      /* --- Login --- */
      .addCase(login.pending, (state) => {
        state.isLoggingIn = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.authUser = action.payload;
        state.isLoggingIn = false;
      })
      .addCase(login.rejected, (state) => {
        state.isLoggingIn = false;
      })

      /* --- Update Profile --- */
      .addCase(updateProfile.pending, (state) => {
        state.isUpdatingProfile = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.authUser = action.payload; 
        state.isUpdatingProfile = false;
      })
      .addCase(updateProfile.rejected, (state) => {
        state.isUpdatingProfile = false;
      })

      /* --- Logout --- */
      .addCase(logout.fulfilled, (state) => {
        state.authUser = null;
        state.onlineUsers = [];
      });
  },
});

export const { logoutUser, setOnlineUsers } = authSlice.actions;
export default authSlice.reducer;