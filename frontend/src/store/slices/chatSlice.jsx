import { createSlice } from "@reduxjs/toolkit";
import {
  getUsers,
  getMessages,
  sendMessage,
  forwardMessageThunk,
  editMessageThunk,
  clearChatThunk,
} from "../thunks/chatThunks";

/**
 * chatSlice: Optimized for high-frequency updates (typing, seen, reactions).
 * We maintain flat structures to ensure React's shallow comparison is fast.
 */
const chatSlice = createSlice({
  name: "chat",
  initialState: {
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    isClearingChat: false,
    typingUsers: [],
    searchTerm: "",
    unreadCounts: {},
    // Persistence handled with fallback to ensure no null breaks
    notificationsEnabled:
      localStorage.getItem("chat-notifications") !== "false",
    unreadBadgesEnabled: localStorage.getItem("chat-badges") !== "false",
  },
  reducers: {
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    addMessage: (state, action) => {
      // Optimization: Check for duplicates before pushing
      const exists = state.messages.some((m) => m._id === action.payload._id);
      if (!exists) state.messages.push(action.payload);
    },
    removeMessage: (state, action) => {
      state.messages = state.messages.filter(
        (msg) => msg._id !== action.payload
      );
    },
    updateMessageReactions: (state, action) => {
      const { messageId, reactions } = action.payload;
      // Optimization: Use find() to update the reference directly (Immer handles the rest)
      const message = state.messages.find((m) => m._id === messageId);
      if (message) message.reactions = reactions;
    },
    setTyping: (state, action) => {
      const { userId, isTyping } = action.payload;
      if (isTyping) {
        if (!state.typingUsers.includes(userId)) state.typingUsers.push(userId);
      } else {
        state.typingUsers = state.typingUsers.filter((id) => id !== userId);
      }
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    markMessagesAsSeenLocally: (state) => {
      // Background update: Iterate once
      state.messages.forEach((msg) => {
        if (!msg.isSeen) msg.isSeen = true;
      });
    },
    incrementUnreadCount: (state, action) => {
      const userId = action.payload;
      state.unreadCounts[userId] = (state.unreadCounts[userId] || 0) + 1;
    },
    clearUnreadCount: (state, action) => {
      state.unreadCounts[action.payload] = 0;
    },
    toggleNotifications: (state) => {
      state.notificationsEnabled = !state.notificationsEnabled;
      localStorage.setItem("chat-notifications", state.notificationsEnabled);
    },
    toggleBadges: (state) => {
      state.unreadBadgesEnabled = !state.unreadBadgesEnabled;
      localStorage.setItem("chat-badges", state.unreadBadgesEnabled);
    },
    updateUserStatus: (state, action) => {
      const { userId, lastSeen } = action.payload;
      const user = state.users.find((u) => u._id === userId);
      if (user) user.lastSeen = lastSeen;

      if (state.selectedUser?._id === userId) {
        state.selectedUser.lastSeen = lastSeen;
      }
    },
    clearAllUnread: (state) => {
      state.unreadCounts = {};
    },
    updateMessage: (state, action) => {
      const index = state.messages.findIndex(
        (m) => m._id === action.payload._id
      );
      if (index !== -1) state.messages[index] = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUsers.pending, (state) => {
        state.isUsersLoading = true;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.users = action.payload;
        state.isUsersLoading = false;
      })
      .addCase(getMessages.pending, (state) => {
        state.isMessagesLoading = true;
      })
      .addCase(getMessages.fulfilled, (state, action) => {
        state.messages = action.payload;
        state.isMessagesLoading = false;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      })
      .addCase(forwardMessageThunk.fulfilled, (state, action) => {
        if (
          state.selectedUser &&
          action.payload.receiverId === state.selectedUser._id
        ) {
          state.messages.push(action.payload);
        }
      })
      .addCase(editMessageThunk.fulfilled, (state, action) => {
        const index = state.messages.findIndex(
          (m) => m._id === action.payload._id
        );
        if (index !== -1) state.messages[index] = action.payload;
      })
      .addCase(clearChatThunk.pending, (state) => {
        state.isClearingChat = true;
      })
      .addCase(clearChatThunk.fulfilled, (state) => {
        state.messages = [];
        state.isClearingChat = false;
      })
      .addCase(clearChatThunk.rejected, (state) => {
        state.isClearingChat = false;
      });
  },
});

export const {
  setSelectedUser,
  addMessage,
  setTyping,
  removeMessage,
  setSearchTerm,
  markMessagesAsSeenLocally,
  incrementUnreadCount,
  clearUnreadCount,
  toggleNotifications,
  toggleBadges,
  updateUserStatus,
  clearAllUnread,
  updateMessageReactions,
  updateMessage,
  clearMessages,
} = chatSlice.actions;

export default chatSlice.reducer;
