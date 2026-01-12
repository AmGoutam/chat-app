import { useEffect, useState, useCallback, memo, useMemo } from "react"; // Added optimization hooks
import { useDispatch, useSelector } from "react-redux";
import { getUsers } from "../store/thunks/chatThunks";
import { setSelectedUser, clearUnreadCount } from "../store/slices/chatSlice";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Search, X } from "lucide-react";
import { formatRelativeTime } from "../lib/utils";

/**
 * OPTIMIZATION: Extract UserItem into a memoized component.
 * This prevents the entire list from re-rendering when only one user's status changes.
 */
const UserItem = memo(({ user, isSelected, isOnline, unreadCount, unreadBadgesEnabled, isMe, onClick }) => (
  <div
    onClick={() => onClick(user)}
    role="button"
    tabIndex={0}
    onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && onClick(user)}
    className={`
      w-full p-3 lg:p-4 flex items-center gap-3 cursor-pointer
      transition-colors duration-300 border-l-4
      relative group
      ${isSelected
        ? "bg-base-200/80 border-primary"
        : "border-transparent hover:bg-base-200/50 hover:border-primary/30"
      }
    `}
  >
    {!isSelected && (
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-primary rounded-r-full transition-all duration-300 group-hover:h-12" />
    )}

    <div className="relative mx-auto lg:mx-0 flex-shrink-0">
      <img
        src={user.profilePic || "/avatar.png"}
        alt={user.fullName}
        className="size-12 object-cover rounded-full border-2 border-base-300 shadow-md transition-shadow duration-300 group-hover:shadow-lg"
        loading="lazy" // Optimization: Browser-level lazy loading
      />
      {isOnline && (
        <>
          <span className="absolute bottom-0 right-0 size-3.5 bg-success rounded-full ring-2 ring-base-100 animate-pulse z-10" />
          <span className="absolute bottom-0 right-0 size-3.5 bg-success rounded-full ring-2 ring-base-100 animate-ping z-10" />
        </>
      )}
    </div>

    <div className="hidden lg:flex flex-1 flex-col text-left min-w-0 gap-1">
      <div className="flex items-center justify-between gap-2">
        <span className={`font-semibold truncate text-sm transition-colors ${isSelected ? 'text-primary' : 'group-hover:text-primary'}`}>
          {user.fullName}
        </span>
        {user.lastMessage && (
          <span className="text-[10px] opacity-60 font-medium whitespace-nowrap">
            {formatRelativeTime(user.lastMessage.createdAt)}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="text-xs text-base-content/60 truncate flex-1 group-hover:text-base-content/80 transition-colors">
          {user.lastMessage ? (
            <span className="truncate flex items-center gap-1">
              {isMe && <span className="text-primary font-semibold">You:</span>}
              {user.lastMessage.image ? (
                <span className="flex items-center gap-1">📷 <span className="opacity-70">Photo</span></span>
              ) : (
                <span className={isMe ? '' : 'font-medium'}>{user.lastMessage.text}</span>
              )}
            </span>
          ) : (
            <span className="text-xs italic opacity-50">No messages yet</span>
          )}
        </div>

        {unreadBadgesEnabled && unreadCount > 0 && (
          <span className="bg-gradient-to-br from-primary to-primary/80 text-primary-content text-[10px] font-bold px-2 py-1 rounded-full min-w-[1.3rem] text-center shadow-md animate-scaleIn ring-2 ring-primary/20">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>
    </div>

    {unreadBadgesEnabled && unreadCount > 0 && (
      <span className="lg:hidden absolute top-2 right-2 bg-primary text-primary-content text-[9px] font-bold size-5 rounded-full flex items-center justify-center shadow-lg animate-scaleIn">
        {unreadCount > 9 ? '9+' : unreadCount}
      </span>
    )}
  </div>
));

const Sidebar = () => {
  const dispatch = useDispatch();

  // --- OPTIMIZATION: Selector Precision ---
  const users = useSelector((state) => state.chat.users || []);
  const selectedUser = useSelector((state) => state.chat.selectedUser);
  const isUsersLoading = useSelector((state) => state.chat.isUsersLoading);
  const unreadCounts = useSelector((state) => state.chat.unreadCounts || {});
  const unreadBadgesEnabled = useSelector((state) => state.chat.unreadBadgesEnabled);
  const onlineUsers = useSelector((state) => state.auth.onlineUsers || []);
  const authUser = useSelector((state) => state.auth.authUser);

  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch]);

  // OPTIMIZATION: useMemo for filtering logic to prevent expensive array work on every render
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesOnline = showOnlineOnly ? onlineUsers.includes(user._id) : true;
      const matchesSearch = user.fullName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesOnline && matchesSearch;
    });
  }, [users, showOnlineOnly, onlineUsers, searchQuery]);

  const handleUserClick = useCallback((user) => {
    dispatch(setSelectedUser(user));
    dispatch(clearUnreadCount(user._id));
  }, [dispatch]);

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 xl:w-80 border-r border-base-300/50 flex flex-col transition-all duration-300 bg-gradient-to-b from-base-100 to-base-200/30">
      <div className="border-b border-base-300/50 w-full p-4 lg:p-5 bg-base-100/50 backdrop-blur-sm">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="size-5 text-primary" />
          </div>
          <span className="font-bold hidden lg:block text-lg bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Contacts
          </span>
        </div>

        <div className="hidden lg:block mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/40 pointer-events-none" />
            <input
              type="text"
              placeholder="Search contacts..."
              className="input input-sm w-full pl-10 pr-10 bg-base-200/50 backdrop-blur-sm border-base-300/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-error transition-all duration-200 hover:scale-110"
                type="button"
              ><X className="size-4" /></button>
            )}
          </div>
        </div>

        <div className="hidden lg:flex items-center justify-between gap-2">
          <label className="cursor-pointer flex items-center gap-2 group">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm checkbox-primary transition-all duration-200"
            />
            <span className="text-sm font-medium group-hover:text-primary transition-colors">Show online only</span>
          </label>
          <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success font-semibold">
            {Math.max(0, onlineUsers.length - 1)} online
          </span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-2 flex-1 scroll-smooth">
        {filteredUsers.map((user) => (
          <UserItem
            key={user._id}
            user={user}
            isSelected={selectedUser?._id === user._id}
            isOnline={onlineUsers.includes(user._id)}
            unreadCount={unreadCounts[user._id] || 0}
            unreadBadgesEnabled={unreadBadgesEnabled}
            isMe={user.lastMessage?.senderId === authUser?._id}
            onClick={handleUserClick}
          />
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-base-content/40 py-16 px-4 animate-fadeIn">
            <div className="size-16 mx-auto mb-4 rounded-full bg-base-200 flex items-center justify-center">
              <Search className="size-8 opacity-30" />
            </div>
            <p className="text-sm font-medium mb-1">{searchQuery ? "No matching contacts" : "Your contact list is empty"}</p>
            <p className="text-xs opacity-60">{searchQuery ? "Try a different search term" : "Start a new conversation"}</p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInLeft { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeInLeft { animation: fadeInLeft 0.4s ease-out forwards; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        aside > div:last-child::-webkit-scrollbar { width: 6px; }
        aside > div:last-child::-webkit-scrollbar-track { background: transparent; }
        aside > div:last-child::-webkit-scrollbar-thumb { background: oklch(var(--b3)); border-radius: 10px; transition: background 0.2s; }
        aside > div:last-child::-webkit-scrollbar-thumb:hover { background: oklch(var(--bc) / 0.3); }
        * { transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }
      `}</style>
    </aside>
  );
};

export default Sidebar;