import { useState, useCallback, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../store/thunks/authThunks";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, ArrowRight, Sparkles, Shield } from "lucide-react";
import AuthImagePattern from "../components/AuthImagePattern";

// --- OPTIMIZATION: Memoize static UI elements ---
const TrustIndicators = memo(() => (
  <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 sm:pt-6 animate-slideUp" style={{ animationDelay: '0.3s' }}>
    <div className="text-center p-2 sm:p-3 rounded-lg bg-base-200/30 backdrop-blur-sm border border-base-300/30 hover:border-primary/30 hover:bg-base-200/50 transition-all duration-300 group cursor-default">
      <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary mx-auto mb-1 group-hover:scale-110 transition-transform duration-300" />
      <div className="text-base sm:text-xl font-bold text-primary group-hover:scale-105 transition-transform duration-300">256</div>
      <div className="text-[10px] sm:text-xs text-base-content/60 mt-0.5 sm:mt-1">Encryption</div>
    </div>
    <div className="text-center p-2 sm:p-3 rounded-lg bg-base-200/30 backdrop-blur-sm border border-base-300/30 hover:border-primary/30 hover:bg-base-200/50 transition-all duration-300 group cursor-default">
      <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-primary mx-auto mb-1 group-hover:scale-110 transition-transform duration-300" />
      <div className="text-base sm:text-xl font-bold text-primary group-hover:scale-105 transition-transform duration-300">100%</div>
      <div className="text-[10px] sm:text-xs text-base-content/60 mt-0.5 sm:mt-1">Secure</div>
    </div>
    <div className="text-center p-2 sm:p-3 rounded-lg bg-base-200/30 backdrop-blur-sm border border-base-300/30 hover:border-primary/30 hover:bg-base-200/50 transition-all duration-300 group cursor-default">
      <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-primary mx-auto mb-1 group-hover:scale-110 transition-transform duration-300" />
      <div className="text-base sm:text-xl font-bold text-primary group-hover:scale-105 transition-transform duration-300">24/7</div>
      <div className="text-[10px] sm:text-xs text-base-content/60 mt-0.5 sm:mt-1">Support</div>
    </div>
  </div>
));

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const dispatch = useDispatch();
  // Optimization: Select only the required value
  const isLoggingIn = useSelector((state) => state.auth.isLoggingIn);

  // --- OPTIMIZATION: Memoized Handlers ---
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    dispatch(login(formData));
  }, [dispatch, formData]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-gradient-to-br from-base-100 via-base-200/30 to-base-100">
      <div className="flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 lg:p-12 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-48 h-48 sm:w-72 sm:h-72 bg-primary/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 -right-20 w-64 h-64 sm:w-96 sm:h-96 bg-secondary/5 rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-48 sm:h-48 bg-accent/3 rounded-full blur-2xl animate-pulse-slow" />
        </div>

        <div className="w-full max-w-md space-y-6 sm:space-y-8 relative z-10">
          <div className="text-center mb-6 sm:mb-8 animate-fadeIn pt-9">
            <div className="flex flex-col items-center gap-2 group">
              <div className="relative py-2">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-lg hover:shadow-2xl hover:shadow-primary/20">
                  <MessageSquare className="w-7 h-7 sm:w-8 sm:h-8 text-primary group-hover:rotate-12 transition-transform duration-500" />
                </div>
                <div className="absolute top-1 right-0 animate-bounce-slow">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl animate-pulse-slow opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mt-3 sm:mt-4 bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                Welcome Back
              </h1>
              <p className="text-sm sm:text-base text-base-content/60 font-medium">Sign in to continue your journey</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 animate-slideUp" style={{ animationDelay: '0.1s' }}>
            <div className="form-control">
              <label className="label pb-2">
                <span className="label-text font-semibold flex items-center gap-2 text-sm sm:text-base">
                  <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  Email Address
                </span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none transition-all duration-300 group-focus-within:text-primary">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-base-content/40 group-focus-within:scale-110 transition-transform duration-300" />
                </div>
                <input
                  type="email"
                  name="email"
                  className="input input-bordered w-full pl-10 sm:pl-12 pr-4 h-11 sm:h-12 text-sm sm:text-base bg-base-200/50 backdrop-blur-sm transition-all duration-300 focus:bg-base-100 focus:ring-2 focus:ring-primary/30 focus:border-primary hover:border-primary/50 hover:shadow-md"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label pb-2">
                <span className="label-text font-semibold flex items-center gap-2 text-sm sm:text-base">
                  <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  Password
                </span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none transition-all duration-300 group-focus-within:text-primary">
                  <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-base-content/40 group-focus-within:scale-110 transition-transform duration-300" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="input input-bordered w-full pl-10 sm:pl-12 pr-12 h-11 sm:h-12 text-sm sm:text-base bg-base-200/50 backdrop-blur-sm transition-all duration-300 focus:bg-base-100 focus:ring-2 focus:ring-primary/30 focus:border-primary hover:border-primary/50 hover:shadow-md"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                {/* RESTORED EYE ICON: Kept inside the div relative exactly as original */}
                <div
                  className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-base-content/50 hover:text-primary transition-colors duration-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-base-content/50 hover:text-primary transition-colors duration-300" />
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full h-11 sm:h-12 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 group relative mt-6 sm:mt-8 active:scale-[0.98] "
              disabled={isLoggingIn}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoggingIn ? (
                  <>
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    <span className="hidden xs:inline">Signing in...</span>
                    <span className="xs:hidden">Loading...</span>
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </span>
            </button>
          </form>

          <div className="text-center pt-3 sm:pt-4 animate-slideUp" style={{ animationDelay: '0.2s' }}>
            <div className="bg-base-200/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-base-300/50 hover:border-primary/30 transition-all duration-300 hover:shadow-md">
              <p className="text-xs sm:text-sm text-base-content/70">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-primary font-semibold hover:underline inline-flex items-center gap-1 group"
                >
                  Create account
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </p>
            </div>
          </div>

          <TrustIndicators />
        </div>
      </div>

      <AuthImagePattern
        title="Welcome back!"
        subtitle="Sign in to continue your conversations and catch up with your messages."
      />

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-25px) rotate(5deg); } }
        @keyframes float-delayed { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-20px) rotate(-3deg); } }
        @keyframes pulse-slow { 0%, 100% { opacity: 0.8; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.05); } }
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        .animate-fadeIn { animation: fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
        .animate-slideUp { animation: slideUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards; opacity: 0; }
        .animate-float { animation: float 8s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 10s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
        @media (max-width: 375px) { .xs\\:hidden { display: none; } }
        @media (min-width: 376px) { .xs\\:inline { display: inline; } }
      `}</style>
    </div>
  );
};

export default LoginPage;