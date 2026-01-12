import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { memo, useMemo } from "react"; // Added for optimization
import { LogOut, MessageSquare, Settings, User, Sparkles } from "lucide-react";
import { logout } from "../store/thunks/authThunks";

/**
 * Navbar: Optimized with Memoization to prevent unnecessary global re-renders.
 * OPTIMIZATION: Wrapped in memo to skip rendering when parent components update.
 */
const Navbar = () => {
  const dispatch = useDispatch();

  // --- OPTIMIZATION: Selector Precision ---
  // Isolate exactly what we need to avoid re-rendering on unrelated chat/auth changes.
  const authUser = useSelector((state) => state.auth.authUser);
  const unreadCounts = useSelector((state) => state.chat.unreadCounts || {});
  const unreadBadgesEnabled = useSelector((state) => state.chat.unreadBadgesEnabled);

  // --- OPTIMIZATION: memoize heavy calculations ---
  const totalUnreadMessages = useMemo(() => 
    Object.values(unreadCounts).reduce((acc, count) => acc + count, 0),
    [unreadCounts]
  );

  return (
    <header className="bg-base-100/95 border-b border-base-300/50 fixed w-full top-0 z-40 backdrop-blur-xl shadow-sm">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 h-14 sm:h-16">
        <div className="flex items-center justify-between h-full">
          
          {/* Logo Section */}
          <div className="flex items-center gap-4 sm:gap-8">
            <Link 
              to="/" 
              className="flex items-center gap-2 sm:gap-2.5 hover:scale-105 active:scale-95 transition-all duration-300 group"
            >
              <div className="relative">
                <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                  <MessageSquare className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300" />
                </div>
                
                <div className="hidden xs:block absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary animate-pulse-slow" />
                </div>

                {unreadBadgesEnabled && totalUnreadMessages > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 sm:h-5 sm:w-5 animate-fadeIn">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-5 w-5 bg-gradient-to-br from-primary to-primary/80 text-[10px] text-primary-content items-center justify-center font-bold shadow-lg ring-2 ring-base-100">
                      {totalUnreadMessages > 99 ? "99+" : totalUnreadMessages > 9 ? "9+" : totalUnreadMessages}
                    </span>
                  </span>
                )}
              </div>

              <h1 className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent transition-all duration-300">
                Chatty
              </h1>
            </Link>
          </div>

          {/* Navigation Actions */}
          <nav className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
            <Link 
              to="/settings" 
              className="nav-btn btn btn-sm sm:btn-md btn-ghost gap-1.5 sm:gap-2 hover:bg-primary/10 hover:text-primary transition-all duration-300 group px-2 sm:px-3"
            >
              <Settings className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 group-hover:rotate-90 transition-transform duration-500" />
              <span className="hidden sm:inline font-medium text-sm md:text-base">Settings</span>
            </Link>

            {authUser && (
              <>
                <Link 
                  to="/profile" 
                  className="nav-btn btn btn-sm sm:btn-md btn-ghost gap-1.5 sm:gap-2 hover:bg-primary/10 hover:text-primary transition-all duration-300 group px-2 sm:px-3"
                >
                  <User className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform duration-300" />
                  <span className="hidden sm:inline font-medium text-sm md:text-base">Profile</span>
                </Link>

                <button
                  className="nav-btn btn btn-sm sm:btn-md btn-ghost gap-1.5 sm:gap-2 hover:bg-error/10 hover:text-error transition-all duration-300 group px-2 sm:px-3 active:scale-95"
                  onClick={() => dispatch(logout())}
                  type="button"
                >
                  <LogOut className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 group-hover:translate-x-0.5 transition-transform duration-300" />
                  <span className="hidden sm:inline font-medium text-sm md:text-base">Logout</span>
                </button>
              </>
            )}
          </nav>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
        @keyframes pulse-slow { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
        .nav-btn { position: relative; overflow: visible !important; }
        .nav-btn::before, .nav-btn::after { display: none !important; content: none !important; }
        .nav-btn:focus { outline: none !important; }
        .nav-btn:focus-visible { outline: 2px solid oklch(var(--p) / 0.4) !important; outline-offset: 2px !important; }
        nav a::before, nav a::after, nav button::before, nav button::after { display: none !important; }
        .animate-ping { animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; }
        @keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }
        @media (min-width: 376px) { .xs\\:block { display: block; } }
        @media (max-width: 375px) { .xs\\:block { display: none; } }
      `}</style>
    </header>
  );
};

export default memo(Navbar); // Optimized Export