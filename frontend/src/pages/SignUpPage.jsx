import { useState, useRef, useCallback, memo } from "react"; // Added memo and useCallback
import { useDispatch, useSelector } from "react-redux";
import { signup } from "../store/thunks/authThunks";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, User, Camera, X, ArrowRight, Sparkles, Shield } from "lucide-react";
import AuthImagePattern from "../components/AuthImagePattern";
import toast from "react-hot-toast";

// --- OPTIMIZATION: Memoize static UI components ---
const PasswordStrengthIndicator = memo(({ passwordLength }) => (
  <div className="text-xs sm:text-sm text-base-content/60 bg-base-200/30 backdrop-blur-sm rounded-lg p-3 border border-base-300/30">
    <div className="flex items-center gap-2 mb-2">
      <Shield className="w-3.5 h-3.5 text-primary" />
      <span className="font-semibold">Password must contain:</span>
    </div>
    <ul className="space-y-1 ml-5">
      <li className={`transition-colors ${passwordLength >= 6 ? 'text-success' : 'text-base-content/50'}`}>
        • At least 6 characters
      </li>
    </ul>
  </div>
));

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    profilePic: "",
  });

  const dispatch = useDispatch();
  // Optimization: Select only what's needed
  const isSigningUp = useSelector((state) => state.auth.isSigningUp);

  // --- OPTIMIZATION: Memoized Handlers ---
  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return toast.error("Please select an image file");
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      const base64Image = reader.result;
      setImagePreview(base64Image);
      setFormData(prev => ({ ...prev, profilePic: base64Image }));
    };
  }, []);

  const removeImage = useCallback(() => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, profilePic: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const validateForm = () => {
    if (!formData.fullName.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = validateForm();
    if (success === true) dispatch(signup(formData));
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-gradient-to-br from-base-100 via-base-200/30 to-base-100">
      <div className="flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 lg:p-12 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-48 h-48 sm:w-72 sm:h-72 bg-primary/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 -right-20 w-64 h-64 sm:w-96 sm:h-96 bg-secondary/5 rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-48 sm:h-48 bg-accent/3 rounded-full blur-2xl animate-pulse-slow" />
        </div>

        <div className="w-full max-w-md space-y-6 sm:space-y-8 relative z-10">
          <div className="text-center mb-4 sm:mb-6 animate-fadeIn pt-9">
            <div className="flex flex-col items-center gap-2 group">
              <div className="relative py-2">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-lg hover:shadow-2xl hover:shadow-primary/20">
                  <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 text-primary group-hover:rotate-12 transition-transform duration-500" />
                </div>
                <div className="absolute top-1 right-0 animate-bounce-slow">
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                </div>
                <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl animate-pulse-slow opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mt-2 sm:mt-3 bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                Create Account
              </h1>
              <p className="text-sm sm:text-base text-base-content/60 font-medium">Get started with your free account</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 animate-slideUp" style={{ animationDelay: '0.1s' }}>
            <div className="flex flex-col items-center gap-3 pb-2">
              <div className="relative group/avatar">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full blur-xl opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-500" />
                <img
                  src={imagePreview || "/avatar.png"}
                  alt="Preview"
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-base-300 group-hover/avatar:border-primary/50 transition-all duration-300 shadow-lg relative z-10"
                />

                <label
                  htmlFor="avatar-upload"
                  className={`
                    absolute bottom-0 right-0 z-20
                    p-2 sm:p-2.5 rounded-full cursor-pointer 
                    transition-all duration-300
                    hover:scale-110 active:scale-95
                    shadow-lg hover:shadow-xl
                    ${imagePreview ? "bg-error hover:bg-error/90" : "bg-primary hover:bg-primary/90"}
                  `}
                  onClick={(e) => { if (imagePreview) { e.preventDefault(); removeImage(); } }}
                >
                  {imagePreview ? <X className="w-4 h-4 sm:w-5 sm:h-5 text-base-100" /> : <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-base-100" />}
                  <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={handleImageChange} ref={fileInputRef} disabled={isSigningUp} />
                </label>
              </div>
              <p className="text-xs sm:text-sm text-base-content/60 font-medium">
                {imagePreview ? "Click 'X' to remove" : "Add a profile photo"}
              </p>
            </div>

            <div className="form-control">
              <label className="label pb-2"><span className="label-text font-semibold flex items-center gap-2 text-sm sm:text-base"><User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />Full Name</span></label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none transition-all duration-300 group-focus-within:text-primary">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-base-content/40 group-focus-within:scale-110 transition-transform duration-300" />
                </div>
                <input name="fullName" type="text" className="input input-bordered w-full pl-10 sm:pl-12 pr-4 h-11 sm:h-12 text-sm sm:text-base bg-base-200/50 transition-all duration-300 focus:bg-base-100 focus:ring-2 focus:ring-primary/30" placeholder="John Doe" value={formData.fullName} onChange={handleInputChange} />
              </div>
            </div>

            <div className="form-control">
              <label className="label pb-2"><span className="label-text font-semibold flex items-center gap-2 text-sm sm:text-base"><Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />Email Address</span></label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none transition-all duration-300 group-focus-within:text-primary">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-base-content/40 group-focus-within:scale-110 transition-transform duration-300" />
                </div>
                <input name="email" type="email" className="input input-bordered w-full pl-10 sm:pl-12 pr-4 h-11 sm:h-12 text-sm sm:text-base bg-base-200/50 transition-all duration-300 focus:bg-base-100 focus:ring-2 focus:ring-primary/30" placeholder="you@example.com" value={formData.email} onChange={handleInputChange} />
              </div>
            </div>

            <div className="form-control">
              <label className="label pb-2"><span className="label-text font-semibold flex items-center gap-2 text-sm sm:text-base"><Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />Password</span></label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none transition-all duration-300 group-focus-within:text-primary">
                  <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-base-content/40 group-focus-within:scale-110 transition-transform duration-300" />
                </div>
                <input name="password" type={showPassword ? "text" : "password"} className="input input-bordered w-full pl-10 sm:pl-12 pr-12 h-11 sm:h-12 text-sm sm:text-base bg-base-200/50 transition-all duration-300 focus:bg-base-100 focus:ring-2 focus:ring-primary/30" placeholder="••••••••" value={formData.password} onChange={handleInputChange} />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-5 w-5 text-base-content/50 hover:text-primary transition-colors" /> : <Eye className="h-5 w-5 text-base-content/50 hover:text-primary transition-colors" />}
                </div>
              </div>
            </div>

            <PasswordStrengthIndicator passwordLength={formData.password.length} />

            <button type="submit" className="btn btn-primary w-full h-11 sm:h-12 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group relative mt-6 active:scale-[0.98] " disabled={isSigningUp}>
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSigningUp ? (
                  <>
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    <span className="hidden xs:inline">Creating Account...</span>
                    <span className="xs:hidden">Creating...</span>
                  </>
                ) : (
                  <>Create Account <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" /></>
                )}
              </span>
            </button>
          </form>

          <div className="text-center pt-3 sm:pt-4 animate-slideUp" style={{ animationDelay: '0.2s' }}>
            <div className="bg-base-200/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-base-300/50 hover:border-primary/30 transition-all duration-300">
              <p className="text-xs sm:text-sm text-base-content/70">
                Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline inline-flex items-center gap-1 group">Sign in <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" /></Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <AuthImagePattern title="Join our community" subtitle="Connect with friends, share moments, and stay in touch with your loved ones." />

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

export default SignUpPage;