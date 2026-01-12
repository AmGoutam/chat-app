import { MessageSquare, Users, Zap, Heart, Shield, Star, Sparkles, TrendingUp, Award } from "lucide-react";
import { memo } from "react"; // Added memo for optimization

/**
 * AuthImagePattern is a decorative component used on the Login and Signup pages.
 * OPTIMIZATION: Wrapped in memo to prevent re-renders when parent form state updates.
 */
const AuthImagePattern = memo(({ title, subtitle }) => {
  // Icon array for the grid
  const icons = [
    MessageSquare,
    Users,
    Zap,
    Heart,
    Shield,
    Star,
    Sparkles,
    TrendingUp,
    Award
  ];

  return (
    <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-base-200 via-base-300/50 to-base-200 p-12 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <div className="max-w-md text-center relative z-10">
        {/* 3x3 Grid of animated squares with icons */}
        <div className="grid grid-cols-3 gap-4 mb-10 perspective-1000">
          {[...Array(9)].map((_, i) => {
            const Icon = icons[i];
            const isEven = i % 2 === 0;
            const delay = i * 0.1;

            return (
              <div
                key={i}
                className="aspect-square rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent backdrop-blur-sm border border-primary/10 relative group overflow-hidden transform-gpu animate-fadeInUp hover:scale-105 transition-all duration-500 cursor-default"
                style={{
                  animationDelay: `${delay}s`,
                  animationFillMode: 'backwards'
                }}
                aria-hidden="true"
              >
                {/* Animated gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${isEven ? 'animate-pulse-slow' : ''}`} />

                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                {/* Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon
                    className={`w-8 h-8 text-primary/60 group-hover:text-primary group-hover:scale-110 transition-all duration-500 ${isEven ? 'animate-float-icon' : 'animate-float-icon-delayed'}`}
                    strokeWidth={1.5}
                    // OPTIMIZATION: Inform browser of upcoming transform
                    style={{ willChange: "transform, opacity" }}
                  />
                </div>

                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            );
          })}
        </div>

        {/* Text Content */}
        <div className="space-y-4 animate-fadeInUp" style={{ animationDelay: '0.5s', animationFillMode: 'backwards' }}>
          <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent leading-tight">
            {title}
          </h2>
          <p className="text-base-content/70 text-lg leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Decorative dots */}
        <div className="flex justify-center gap-2 mt-8 animate-fadeInUp" style={{ animationDelay: '0.7s', animationFillMode: 'backwards' }}>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary/30 animate-bounce-slow"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-30px) rotate(5deg); } }
        @keyframes float-delayed { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-25px) rotate(-5deg); } }
        @keyframes float-icon { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        @keyframes float-icon-delayed { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
        @keyframes pulse-slow { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .animate-fadeInUp { animation: fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .animate-float { animation: float 10s ease-in-out infinite; }
        .animate-float-delayed { animation: float 12s ease-in-out infinite; }
        .animate-float-icon { animation: float-icon 3s ease-in-out infinite; }
        .animate-float-icon-delayed { animation: float-icon-delayed 4s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
        .perspective-1000 { perspective: 1000px; }
        .transform-gpu { transform: translateZ(0); backface-visibility: hidden; }
      `}</style>
    </div>
  );
});

export default AuthImagePattern;