import { useDispatch, useSelector } from "react-redux";
import { memo, useCallback } from "react"; // Added memo and useCallback
import { THEMES } from "../constants";
import { setTheme } from "../store/slices/themeSlice";
import { toggleNotifications, toggleBadges } from "../store/slices/chatSlice";
import { Send, Volume2, Bell, Palette, Eye, Check } from "lucide-react";
import { playNotificationSound } from "../lib/utils";

const PREVIEW_MESSAGES = [
  { id: 1, content: "Hey! How's it going?", isSent: false },
  { id: 2, content: "I'm doing great! Just working on some new features.", isSent: true },
];

// --- OPTIMIZATION: Memoized individual Theme Button ---
const ThemeButton = memo(({ t, activeTheme, onSelect }) => (
  <button
    className={`
      group relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-300
      ${activeTheme === t 
        ? "bg-primary/10 ring-2 ring-primary shadow-lg scale-105" 
        : "bg-base-200/50 hover:bg-base-200 hover:scale-105 hover:shadow-md"
      }
    `}
    onClick={() => onSelect(t)}
  >
    <div className="relative h-10 w-full rounded-lg overflow-hidden shadow-md" data-theme={t}>
      <div className="absolute inset-0 grid grid-cols-4 gap-0.5 p-1">
        <div className="rounded bg-primary transition-transform group-hover:scale-110"></div>
        <div className="rounded bg-secondary transition-transform group-hover:scale-110"></div>
        <div className="rounded bg-accent transition-transform group-hover:scale-110"></div>
        <div className="rounded bg-neutral transition-transform group-hover:scale-110"></div>
      </div>
    </div>
    <span className="text-xs font-semibold truncate w-full text-center">
      {t.charAt(0).toUpperCase() + t.slice(1)}
    </span>
    {activeTheme === t && (
      <div className="absolute -top-1 -right-1 size-5 bg-primary rounded-full flex items-center justify-center shadow-lg animate-scaleIn">
        <Check className="size-3 text-primary-content" />
      </div>
    )}
  </button>
));

// --- OPTIMIZATION: Memoized Mock Chat Preview ---
const ChatPreview = memo(({ theme }) => (
  <div className="rounded-xl border-2 border-base-300 overflow-hidden shadow-xl" data-theme={theme}>
    <div className="p-6 bg-gradient-to-br from-base-200 to-base-100">
      <div className="max-w-2xl mx-auto">
        <div className="bg-base-100 rounded-2xl shadow-2xl overflow-hidden border border-base-300">
          <div className="px-5 py-4 border-b border-base-300 bg-gradient-to-r from-base-100 to-base-200/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="size-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-content font-bold shadow-lg">J</div>
                <div className="absolute bottom-0 right-0 size-3 bg-success rounded-full ring-2 ring-base-100" />
              </div>
              <div>
                <h3 className="font-bold text-sm">John Doe</h3>
                <p className="text-xs text-success flex items-center gap-1">
                  <span className="size-1.5 bg-success rounded-full animate-pulse" />
                  Online
                </p>
              </div>
            </div>
          </div>
          <div className="p-5 space-y-4 min-h-[240px] bg-gradient-to-b from-base-100 to-base-200/30">
            {PREVIEW_MESSAGES.map((message) => (
              <div key={message.id} className={`flex ${message.isSent ? "justify-end" : "justify-start"} animate-fadeIn`}>
                <div className={`max-w-[85%] rounded-2xl p-4 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 ${message.isSent ? "bg-gradient-to-br from-primary to-primary/80 text-primary-content rounded-tr-md" : "bg-base-200 rounded-tl-md"}`}>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className={`text-[10px] mt-2 flex items-center gap-1 ${message.isSent ? "text-primary-content/70 justify-end" : "text-base-content/60"}`}>
                    <span>12:00 PM</span>
                    {message.isSent && <Check className="size-3" />}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-5 border-t border-base-300 bg-gradient-to-t from-base-200 to-base-100 backdrop-blur-sm">
            <div className="flex gap-3">
              <input type="text" className="input input-bordered flex-1 text-sm rounded-xl bg-base-200/50 backdrop-blur-sm" value="This is a preview" readOnly />
              <button className="btn btn-primary btn-circle shadow-lg hover:scale-110 transition-transform"><Send size={20} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
));

const SettingsPage = () => {
  const dispatch = useDispatch();
  // Selector optimization: isolate theme and notification state
  const theme = useSelector((state) => state.theme.theme);
  const notificationsEnabled = useSelector((state) => state.chat.notificationsEnabled);
  const unreadBadgesEnabled = useSelector((state) => state.chat.unreadBadgesEnabled);

  // --- OPTIMIZATION: Memoize the selection handler ---
  const handleThemeSelect = useCallback((t) => {
    dispatch(setTheme(t));
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200/30 to-base-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 max-w-6xl">
        
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">Settings</h1>
          <p className="text-base-content/60">Customize your chat experience</p>
        </div>

        <div className="space-y-8">
          {/* THEME SECTION */}
          <div className="animate-slideUp" style={{ animationDelay: '0.1s' }}>
            <div className="bg-base-100/80 backdrop-blur-sm rounded-2xl border border-base-300/50 p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center"><Palette className="size-5 text-primary" /></div>
                <div>
                  <h2 className="text-xl font-bold">Theme</h2>
                  <p className="text-sm text-base-content/60">Choose your perfect color scheme</p>
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {THEMES.map((t) => (
                  <ThemeButton key={t} t={t} activeTheme={theme} onSelect={handleThemeSelect} />
                ))}
              </div>
            </div>
          </div>

          {/* NOTIFICATIONS SECTION */}
          <div className="animate-slideUp" style={{ animationDelay: '0.2s' }}>
            <div className="bg-base-100/80 backdrop-blur-sm rounded-2xl border border-base-300/50 p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="size-10 rounded-xl bg-secondary/10 flex items-center justify-center"><Bell className="size-5 text-secondary" /></div>
                <div>
                  <h2 className="text-xl font-bold">Notifications</h2>
                  <p className="text-sm text-base-content/60">Manage your alert preferences</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="group p-5 rounded-xl border-2 border-base-300 bg-gradient-to-br from-base-100 to-base-200/30 space-y-4 hover:shadow-lg transition-all duration-300 hover:border-primary/30">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-3 rounded-xl transition-all duration-300 ${notificationsEnabled ? "bg-gradient-to-br from-primary/20 to-primary/10 text-primary shadow-lg" : "bg-base-200 text-base-content/40"}`}><Volume2 size={22} /></div>
                      <div className="flex-1">
                        <p className="font-bold text-base mb-1">Notification Sound</p>
                        <p className="text-xs text-base-content/60 leading-relaxed">Play an alert sound when you receive new messages</p>
                      </div>
                    </div>
                    <input type="checkbox" className="toggle toggle-primary" checked={notificationsEnabled} onChange={() => dispatch(toggleNotifications())} />
                  </div>
                  <button onClick={playNotificationSound} className={`btn btn-sm w-full gap-2 transition-all duration-300 ${notificationsEnabled ? "btn-primary hover:scale-105" : "btn-disabled"}`} disabled={!notificationsEnabled}><Volume2 size={16} /><span>Test Sound</span></button>
                </div>

                <div className="group p-5 rounded-xl border-2 border-base-300 bg-gradient-to-br from-base-100 to-base-200/30 hover:shadow-lg transition-all duration-300 hover:border-secondary/30">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-3 rounded-xl transition-all duration-300 ${unreadBadgesEnabled ? "bg-gradient-to-br from-secondary/20 to-secondary/10 text-secondary shadow-lg" : "bg-base-200 text-base-content/40"}`}><Bell size={22} /></div>
                      <div className="flex-1">
                        <p className="font-bold text-base mb-1">Unread Badges</p>
                        <p className="text-xs text-base-content/60 leading-relaxed">Display unread message count in sidebar and navigation bar</p>
                      </div>
                    </div>
                    <input type="checkbox" className="toggle toggle-secondary" checked={unreadBadgesEnabled} onChange={() => dispatch(toggleBadges())} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PREVIEW SECTION */}
          <div className="animate-slideUp" style={{ animationDelay: '0.3s' }}>
            <div className="bg-base-100/80 backdrop-blur-sm rounded-2xl border border-base-300/50 p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="size-10 rounded-xl bg-accent/10 flex items-center justify-center"><Eye className="size-5 text-accent" /></div>
                <div>
                  <h2 className="text-xl font-bold">Live Preview</h2>
                  <p className="text-sm text-base-content/60">See how your theme looks in action</p>
                </div>
              </div>
              <ChatPreview theme={theme} />
            </div>
          </div>

        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        .animate-slideUp { animation: slideUp 0.6s ease-out forwards; opacity: 0; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default SettingsPage;