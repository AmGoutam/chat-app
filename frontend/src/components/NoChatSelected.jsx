import { MessageSquare, Sparkles, ArrowLeft } from "lucide-react";
import { memo } from "react"; // Added memo for optimization

/**
 * NoChatSelected: Optimized purely decorative landing state.
 * OPTIMIZATION: Wrapped in memo to prevent re-renders when the parent (HomePage)
 * updates its state (like selecting a user).
 */
const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-8 sm:p-16 bg-gradient-to-br from-base-100 via-base-200/30 to-base-100 relative overflow-hidden">
      {/* Animated Background Circles - OPTIMIZATION: translateZ forces GPU rendering */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float" style={{ transform: "translateZ(0)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-float-delayed" style={{ transform: "translateZ(0)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-pulse-slow" style={{ transform: "translateZ(0)" }} />
      </div>

      <div className="max-w-md text-center space-y-6 relative z-10 animate-fadeIn">
        {/* Icon Display */}
        <div className="flex justify-center gap-4 mb-4">
          <div className="relative">
            {/* Main Icon Container */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-lg animate-float backdrop-blur-sm border border-primary/20">
              <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 text-primary animate-pulse-slow" />
              
              <div className="absolute -top-2 -right-2 animate-spin-slow">
                <Sparkles className="w-5 h-5 text-primary/60" />
              </div>
              <div className="absolute -bottom-2 -left-2 animate-spin-slow" style={{ animationDelay: '1s' }}>
                <Sparkles className="w-4 h-4 text-primary/40" />
              </div>
            </div>

            {/* Glowing Ring Effect */}
            <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl animate-pulse-slow" />
            
            {/* Orbiting Dots */}
            <div className="absolute inset-0 animate-spin-very-slow">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rounded-full shadow-lg shadow-primary/50" />
            </div>
            <div className="absolute inset-0 animate-spin-very-slow" style={{ animationDelay: '2s' }}>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-secondary rounded-full shadow-lg shadow-secondary/50" />
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <div className="space-y-3 animate-slideUp" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Welcome to Chatty! 👋
          </h2>
          <p className="text-sm sm:text-base text-base-content/60 leading-relaxed">
            Select a conversation from the sidebar to start chatting and connect with your friends
          </p>
        </div>

        {/* Helpful Hints */}
        <div className="pt-4 space-y-3 animate-slideUp" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-base-content/40">
            <ArrowLeft className="w-4 h-4 animate-pulse" />
            <span>Choose a contact to begin</span>
          </div>

          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <div className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium backdrop-blur-sm border border-primary/20 hover:bg-primary/20 transition-all duration-300 hover:scale-105">
              💬 Real-time messaging
            </div>
            <div className="px-3 py-1.5 rounded-full bg-success/10 text-success text-xs font-medium backdrop-blur-sm border border-success/20 hover:bg-success/20 transition-all duration-300 hover:scale-105">
              ✅ Read receipts
            </div>
            <div className="px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-medium backdrop-blur-sm border border-secondary/20 hover:bg-secondary/20 transition-all duration-300 hover:scale-105">
              📷 Share photos
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-20px) rotate(5deg); } }
        @keyframes float-delayed { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-15px) rotate(-3deg); } }
        @keyframes pulse-slow { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.05); } }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes spin-very-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
        .animate-slideUp { animation: slideUp 0.6s ease-out forwards; opacity: 0; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 10s linear infinite; }
        .animate-spin-very-slow { animation: spin-very-slow 15s linear infinite; }
      `}</style>
    </div>
  );
};

export default memo(NoChatSelected); // Exported with memo