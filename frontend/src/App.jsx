import { useEffect, Suspense, lazy, useCallback } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Loader, MessageSquare, Sparkles } from "lucide-react";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";

// --- OPTIMIZATION: Code Splitting ---
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

import { checkAuth } from "./store/thunks/authThunks";
import { markAsSeenThunk, getUsers } from "./store/thunks/chatThunks";
import { setOnlineUsers } from "./store/slices/authSlice";
import {
  addMessage,
  setTyping,
  markMessagesAsSeenLocally,
  incrementUnreadCount,
  updateMessageReactions,
  updateMessage,
  removeMessage,
  updateUserStatus,
} from "./store/slices/chatSlice";

import { playNotificationSound } from "./lib/utils";

const App = () => {
  const dispatch = useDispatch();

  const { authUser, isCheckingAuth, socket } = useSelector((state) => state.auth || {});
  const { theme } = useSelector((state) => state.theme || { theme: "coffee" });
  const { selectedUser, notificationsEnabled } = useSelector((state) => state.chat || {});

  // 1. Initial Auth Check
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // 2. Socket Listeners (Real-time Updates)
  useEffect(() => {
    if (!socket) return;

    // --- OPTIMIZATION: Named handlers for reliable cleanup ---
    const handleNewMessage = (newMessage) => {
      const isFromSelectedUser = newMessage.senderId === selectedUser?._id;

      if (isFromSelectedUser) {
        dispatch(addMessage(newMessage));
        dispatch(markAsSeenThunk(selectedUser._id));
      } else {
        if (newMessage.senderId) {
          dispatch(incrementUnreadCount(newMessage.senderId));
          if (notificationsEnabled) playNotificationSound();
        }
      }
      dispatch(getUsers());
    };

    const handleMessageReaction = ({ messageId, reactions }) => {
      dispatch(updateMessageReactions({ messageId, reactions }));
    };

    const handleMessageUpdate = (updatedMessage) => {
      dispatch(updateMessage(updatedMessage));
      dispatch(getUsers());
    };

    const handleMessageDeleted = (messageId) => {
      dispatch(removeMessage(messageId));
      dispatch(getUsers());
    };

    const handleOnlineUsers = (users) => {
      dispatch(setOnlineUsers(users));
    };

    const handleUserOffline = ({ userId, lastSeen }) => {
      dispatch(updateUserStatus({ userId, lastSeen }));
    };

    const handleTyping = ({ senderId }) => {
      dispatch(setTyping({ userId: senderId, isTyping: true }));
    };

    const handleStopTyping = ({ senderId }) => {
      dispatch(setTyping({ userId: senderId, isTyping: false }));
    };

    const handleMessagesSeen = ({ seenBy }) => {
      if (seenBy === selectedUser?._id) {
        dispatch(markMessagesAsSeenLocally());
      }
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messageReaction", handleMessageReaction);
    socket.on("messageUpdate", handleMessageUpdate);
    socket.on("messageDeleted", handleMessageDeleted);
    socket.on("getOnlineUsers", handleOnlineUsers);
    socket.on("userOffline", handleUserOffline);
    socket.on("userTyping", handleTyping);
    socket.on("userStoppedTyping", handleStopTyping);
    socket.on("messagesSeen", handleMessagesSeen);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messageReaction", handleMessageReaction);
      socket.off("messageUpdate", handleMessageUpdate);
      socket.off("messageDeleted", handleMessageDeleted);
      socket.off("getOnlineUsers", handleOnlineUsers);
      socket.off("userOffline", handleUserOffline);
      socket.off("userTyping", handleTyping);
      socket.off("userStoppedTyping", handleStopTyping);
      socket.off("messagesSeen", handleMessagesSeen);
    };
  }, [socket, selectedUser?._id, notificationsEnabled, dispatch]);

  if (isCheckingAuth && !authUser) {
    return (
      <div 
        className="flex items-center justify-center min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-100 relative overflow-hidden px-4" 
        data-theme={theme}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 bg-primary/8 rounded-full blur-3xl animate-float-slow opacity-60" />
          <div className="absolute bottom-1/3 right-1/4 w-56 h-56 sm:w-80 sm:h-80 md:w-[28rem] md:h-[28rem] bg-secondary/6 rounded-full blur-3xl animate-float-reverse opacity-50" />
          <div className="absolute top-1/2 right-1/3 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-accent/5 rounded-full blur-2xl animate-float-slow-delayed opacity-40" />
          <div className="absolute inset-0 opacity-[0.015]" 
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, oklch(var(--bc)) 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }}
          />
        </div>

        <div className="flex flex-col items-center gap-6 sm:gap-8 relative z-10 animate-content-entrance">
          <div className="relative group">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent blur-xl animate-pulse-elegant opacity-70 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-3xl bg-gradient-to-br from-base-100 to-base-200 border border-base-300/50 flex items-center justify-center shadow-2xl backdrop-blur-sm transition-all duration-500 group-hover:scale-105 group-hover:border-primary/30">
              <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-primary transition-all duration-500 group-hover:rotate-12" strokeWidth={1.5} />
            </div>
            <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 animate-sparkle">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary drop-shadow-lg" />
            </div>
          </div>

          <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24">
            <div className="absolute inset-0 rounded-full border-2 border-base-300/30" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-primary/50 animate-spin-smooth" />
            <div className="absolute inset-3 sm:inset-4 rounded-full bg-gradient-to-br from-primary/20 to-transparent animate-pulse-elegant" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary/60 animate-spin-slow" strokeWidth={2} />
            </div>
          </div>

          <div className="text-center space-y-2 sm:space-y-3 animate-text-entrance max-w-xs sm:max-w-sm">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-base-content tracking-tight">
              Loading your chats
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-base-content/50 font-light tracking-wide">
              Just a moment, we're preparing everything...
            </p>
          </div>

          <div className="flex gap-2 sm:gap-2.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary/70 animate-dot-pulse"
                style={{ 
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1.4s'
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      data-theme={theme} 
      className="min-h-screen bg-gradient-to-br from-base-100 via-base-200/50 to-base-100 transition-colors duration-700 ease-in-out"
    >
      <Navbar />
      
      {/* --- OPTIMIZATION: Wrap routes in Suspense --- */}
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[80vh]">
          <Loader className="size-10 animate-spin text-primary" />
        </div>
      }>
        <div className="animate-page-enter">
          <Routes>
            <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
            <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
            <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </Suspense>

      <Toaster 
        position="top-center" 
        reverseOrder={false}
        toastOptions={{
          duration: 3500,
          style: {
            background: 'oklch(var(--b1))',
            color: 'oklch(var(--bc))',
            border: '1px solid oklch(var(--b3))',
            borderRadius: '12px',
            padding: '14px 18px',
            boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05)',
            backdropFilter: 'blur(16px)',
            fontSize: '14px',
            fontWeight: '500',
            maxWidth: '90vw',
          },
          success: {
            iconTheme: {
              primary: 'oklch(var(--su))',
              secondary: 'oklch(var(--suc))',
            },
            style: {
              borderLeft: '3px solid oklch(var(--su))',
            },
          },
          error: {
            iconTheme: {
              primary: 'oklch(var(--er))',
              secondary: 'oklch(var(--erc))',
            },
            style: {
              borderLeft: '3px solid oklch(var(--er))',
            },
          },
          loading: {
            iconTheme: {
              primary: 'oklch(var(--p))',
              secondary: 'oklch(var(--pc))',
            },
            style: {
              borderLeft: '3px solid oklch(var(--p))',
            },
          },
        }}
      />

      <style jsx global>{`
        @keyframes content-entrance { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes text-entrance { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes page-enter { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float-slow { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(30px, -30px) scale(1.05); } 66% { transform: translate(-20px, 20px) scale(0.95); } }
        @keyframes float-reverse { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(-30px, 30px) scale(1.05); } 66% { transform: translate(20px, -20px) scale(0.95); } }
        @keyframes float-slow-delayed { 0%, 100% { transform: translate(0, 0) rotate(0deg); } 50% { transform: translate(-15px, -25px) rotate(5deg); } }
        @keyframes pulse-elegant { 0%, 100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 0.7; transform: scale(1.05); } }
        @keyframes spin-smooth { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes sparkle { 0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; } 25% { transform: scale(1.2) rotate(90deg); opacity: 0.8; } 50% { transform: scale(0.9) rotate(180deg); opacity: 1; } 75% { transform: scale(1.1) rotate(270deg); opacity: 0.8; } }
        @keyframes dot-pulse { 0%, 60%, 100% { transform: scale(1); opacity: 0.7; } 30% { transform: scale(1.4); opacity: 1; } }
        .animate-content-entrance { animation: content-entrance 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-text-entrance { animation: text-entrance 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards; opacity: 0; }
        .animate-page-enter { animation: page-enter 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-float-slow { animation: float-slow 20s ease-in-out infinite; }
        .animate-float-reverse { animation: float-reverse 25s ease-in-out infinite; }
        .animate-float-slow-delayed { animation: float-slow-delayed 18s ease-in-out infinite; }
        .animate-pulse-elegant { animation: pulse-elegant 3s ease-in-out infinite; }
        .animate-spin-smooth { animation: spin-smooth 1.5s linear infinite; }
        .animate-spin-slow { animation: spin-slow 3s linear infinite; }
        .animate-sparkle { animation: sparkle 3s ease-in-out infinite; }
        .animate-dot-pulse { animation: dot-pulse 1.4s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        * { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: oklch(var(--b1)); border-radius: 100px; }
        ::-webkit-scrollbar-thumb { background: oklch(var(--b3)); border-radius: 100px; transition: background 0.2s ease; }
        ::-webkit-scrollbar-thumb:hover { background: oklch(var(--bc) / 0.25); }
        * { scrollbar-width: thin; scrollbar-color: oklch(var(--b3)) oklch(var(--b1)); }
        html, body { overflow-x: hidden; }
        * { transition-property: background-color, border-color, color; transition-duration: 0.3s; transition-timing-function: ease-in-out; }
        [class*="animate-"] { transition: none !important; }
        @media (max-width: 640px) { html { font-size: 14px; } }
        @media (min-width: 641px) and (max-width: 1024px) { html { font-size: 15px; } }
        @media (min-width: 1025px) { html { font-size: 16px; } }
      `}</style>
    </div>
  );
};

export default App;