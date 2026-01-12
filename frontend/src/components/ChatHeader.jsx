import { X, Search, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedUser, setSearchTerm } from "../store/slices/chatSlice";
import { clearChatThunk } from "../store/thunks/chatThunks";
import { formatLastSeen } from "../lib/utils";
import { useState, useCallback, memo } from "react"; // Added memo and useCallback
import DeleteConfirmationModal from "./DeleteConfirmationModal";

// --- OPTIMIZATION: Memoize the User Info section ---
const UserInfo = memo(({ user, isOnline }) => (
  <div className="flex items-center gap-3 min-w-0 flex-1">
    <div className="relative flex-shrink-0">
      <div className="size-11 sm:size-12 rounded-full border-2 border-base-300 overflow-hidden ring-2 ring-primary/10 transition-all duration-300 shadow-md">
        <img
          src={user.profilePic || "/avatar.png"}
          alt={user.fullName}
          className="object-cover w-full h-full"
        />
      </div>
      {isOnline && (
        <>
          <div className="absolute bottom-0 right-0 size-3.5 bg-success rounded-full ring-2 ring-base-100 animate-pulse z-10" />
          <div className="absolute bottom-0 right-0 size-3.5 bg-success rounded-full ring-2 ring-base-100 animate-ping z-10" />
        </>
      )}
    </div>

    <div className="min-w-0 flex-1">
      <h3 className="font-bold text-sm sm:text-base leading-tight truncate bg-gradient-to-r from-base-content to-base-content/70 bg-clip-text">
        {user.fullName}
      </h3>
      <div className="text-xs mt-1 flex items-center gap-1.5">
        {isOnline ? (
          <span className="text-success font-semibold flex items-center gap-1.5 animate-fadeIn">
            <span className="size-1.5 bg-success rounded-full shadow-lg shadow-success/50" />
            <span className="hidden sm:inline">Online</span>
            <span className="sm:hidden">●</span>
          </span>
        ) : (
          <span className="text-base-content/50 text-[11px] sm:text-xs animate-fadeIn">
            Last seen {formatLastSeen(user.lastSeen)}
          </span>
        )}
      </div>
    </div>
  </div>
));

const ChatHeader = () => {
  const dispatch = useDispatch();

  // OPTIMIZATION: Select specific state slices to reduce unnecessary renders
  const selectedUser = useSelector((state) => state.chat.selectedUser);
  const searchTerm = useSelector((state) => state.chat.searchTerm);
  const isClearingChat = useSelector((state) => state.chat.isClearingChat);
  const onlineUsers = useSelector((state) => state.auth.onlineUsers);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // OPTIMIZATION: Memoized handlers to maintain function identity
  const handleClearSearch = useCallback(() => {
    dispatch(setSearchTerm(""));
  }, [dispatch]);

  const handleCloseChat = useCallback(() => {
    dispatch(setSearchTerm(""));
    dispatch(setSelectedUser(null));
  }, [dispatch]);

  const confirmClearChat = useCallback(() => {
    if (selectedUser) {
      dispatch(clearChatThunk(selectedUser._id));
      setShowDeleteModal(false);
    }
  }, [selectedUser, dispatch]);

  const onSearchChange = useCallback((e) => {
    dispatch(setSearchTerm(e.target.value));
  }, [dispatch]);

  if (!selectedUser) return null;

  const isOnline = onlineUsers.includes(selectedUser._id);

  return (
    <div className="p-3 sm:p-4 border-b border-base-300/50 bg-gradient-to-r from-base-100/95 to-base-100/90 backdrop-blur-xl sticky top-0 z-20 shadow-sm animate-slideDown">
      <div className="flex items-center justify-between gap-3">
        
        <UserInfo user={selectedUser} isOnline={isOnline} />

        {/* Actions Section */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Search Bar - Desktop */}
          <div className="relative hidden sm:block group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/40 transition-colors group-focus-within:text-primary z-10">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search messages..."
              className="input input-sm input-bordered pl-9 pr-9 w-36 md:w-48 lg:w-56 focus:w-44 md:focus:w-64 lg:focus:w-80 transition-all duration-300 rounded-xl bg-base-200/50 backdrop-blur-sm border-base-300/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-base-100 relative"
              value={searchTerm}
              onChange={onSearchChange}
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute top-1/2 -translate-y-1/2 right-2 text-base-content/60 hover:text-error transition-all duration-200 hover:scale-110 z-20 p-1"
                title="Clear search"
                type="button"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={isClearingChat}
            className={`btn btn-ghost btn-sm btn-circle transition-all duration-300 hover:scale-110 ${
              isClearingChat 
                ? "text-primary" 
                : "text-base-content/50 hover:text-error hover:bg-error/10"
            }`}
            title="Clear conversation"
          >
            {isClearingChat ? (
              <Loader2 size={18} className="sm:w-5 sm:h-5 animate-spin" />
            ) : (
              <Trash2 size={18} className="sm:w-5 sm:h-5" />
            )}
          </button>

          <button
            onClick={handleCloseChat}
            className="btn btn-ghost btn-sm btn-circle hover:bg-base-200 hover:text-error transition-all duration-300 hover:scale-110 hover:rotate-90"
            title="Close chat"
          >
            <X size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Custom Modal call for clearing chat */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmClearChat}
        title="Clear Chat?"
        message={`This will delete all messages with ${selectedUser.fullName}. This action cannot be undone.`}
      />

      {/* Mobile Search Bar */}
      <div className="sm:hidden mt-3 relative group animate-slideDown" style={{ animationDelay: '0.1s' }}>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/40 transition-colors group-focus-within:text-primary z-10">
          <Search size={14} />
        </div>
        <input
          type="text"
          placeholder="Search in conversation..."
          className="input input-sm input-bordered pl-9 pr-9 w-full rounded-xl bg-base-200/50 backdrop-blur-sm border-base-300/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-base-100 transition-all duration-300 relative"
          value={searchTerm}
          onChange={onSearchChange}
        />
        {searchTerm && (
          <button 
            onClick={handleClearSearch} 
            className="absolute top-1/2 -translate-y-1/2 right-2 text-base-content/60 hover:text-error transition-all duration-200 hover:scale-110 z-20 p-1"
            type="button"
            title="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <style jsx>{`
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-slideDown { animation: slideDown 0.4s ease-out; }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        input:focus { box-shadow: 0 0 0 3px oklch(var(--p) / 0.1); }
        button { position: relative; overflow: hidden; }
        button::before {
          content: ''; position: absolute; top: 50%; left: 50%; width: 0; height: 0;
          border-radius: 50%; background: currentColor; opacity: 0.1;
          transform: translate(-50%, -50%); transition: width 0.3s, height 0.3s;
        }
        button:hover::before { width: 100%; height: 100%; }
        .text-success { text-shadow: 0 0 8px oklch(var(--su) / 0.3); }
      `}</style>
    </div>
  );
};

export default memo(ChatHeader);