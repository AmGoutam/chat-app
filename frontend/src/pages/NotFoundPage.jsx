import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, MessageSquare, Sparkles } from "lucide-react";
import { memo } from "react"; // Added for optimization

// --- OPTIMIZATION: Memoize the decorative background ---
const BackgroundDecor = memo(() => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-primary/8 rounded-full blur-3xl animate-float-slow opacity-60" />
    <div className="absolute bottom-1/4 right-1/4 w-72 h-72 sm:w-[28rem] sm:h-[28rem] bg-secondary/6 rounded-full blur-3xl animate-float-reverse opacity-50" />
    <div className="absolute top-1/2 right-1/3 w-48 h-48 sm:w-64 sm:h-64 bg-accent/5 rounded-full blur-2xl animate-float-delayed opacity-40" />
    
    <div className="absolute inset-0 opacity-[0.02]" 
      style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, oklch(var(--bc)) 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }}
    />
  </div>
));

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 pt-14 bg-gradient-to-br from-base-100 via-base-200/50 to-base-100 flex items-center justify-center p-4 overflow-hidden z-50" style={{marginTop : "70px"}}>
      
      <BackgroundDecor />

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl w-full">
        <div className="text-center space-y-6 sm:space-y-8 animate-fade-in-up">
          {/* Decorative Icon */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-500 animate-pulse-slow" />
              
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-base-100 to-base-200 border border-base-300/50 flex items-center justify-center shadow-2xl backdrop-blur-sm group-hover:scale-110 transition-all duration-500">
                <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 text-primary/70 group-hover:text-primary transition-all duration-300 group-hover:rotate-12" strokeWidth={1.5} />
              </div>
              
              <div className="absolute -top-1 -right-1 animate-sparkle">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
            </div>
          </div>

          {/* 404 Number */}
          <div className="relative animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <h1 className="text-8xl sm:text-9xl md:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-primary via-primary to-primary/60 leading-none tracking-tighter">
              404
            </h1>
            <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-32 sm:w-40 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent rounded-full" />
          </div>

          {/* Message */}
          <div className="space-y-3 sm:space-y-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-base-content tracking-tight">
              Page Not Found
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-base-content/60 max-w-md mx-auto leading-relaxed px-4">
              Oops! The page you're looking for seems to have wandered off. Let's get you back on track.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4 sm:pt-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <button
              onClick={() => navigate(-1)}
              className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-base-200/80 hover:bg-base-300 border border-base-300/50 hover:border-primary/30 text-base-content font-semibold transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 sm:gap-3 shadow-lg hover:shadow-xl"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="text-sm sm:text-base">Go Back</span>
            </button>

            <button
              onClick={() => navigate("/")}
              className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-primary text-primary-content font-semibold transition-all duration-300 hover:scale-105 hover:brightness-110 active:scale-95 flex items-center justify-center gap-2 sm:gap-3 shadow-lg hover:shadow-xl"
            >
              <Home size={20} className="group-hover:scale-110 transition-transform duration-300" />
              <span className="text-sm sm:text-base">Go Home</span>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scale-in { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes fade-in { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float-slow { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(30px, -30px) scale(1.05); } 66% { transform: translate(-20px, 20px) scale(0.95); } }
        @keyframes float-reverse { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(-30px, 30px) scale(1.05); } 66% { transform: translate(20px, -20px) scale(0.95); } }
        @keyframes float-delayed { 0%, 100% { transform: translate(0, 0) rotate(0deg); } 50% { transform: translate(-20px, -30px) rotate(5deg); } }
        @keyframes pulse-slow { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.7; } }
        @keyframes sparkle { 0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; } 25% { transform: scale(1.2) rotate(90deg); opacity: 0.8; } 50% { transform: scale(0.9) rotate(180deg); opacity: 1; } 75% { transform: scale(1.1) rotate(270deg); opacity: 0.8; } }
        @keyframes pulse-sequential { 0%, 60%, 100% { transform: scale(1); opacity: 0.4; } 30% { transform: scale(1.5); opacity: 1; } }
        .animate-fade-in-up { animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-scale-in { animation: scale-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-up { animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-float-slow { animation: float-slow 20s ease-in-out infinite; }
        .animate-float-reverse { animation: float-reverse 25s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 18s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-sparkle { animation: sparkle 3s ease-in-out infinite; }
        .animate-pulse-sequential { animation: pulse-sequential 1.4s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default NotFoundPage;