import { useState, useCallback, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Camera, Mail, User, Calendar, Shield, CheckCircle, Upload } from "lucide-react";
import { updateProfile } from "../store/thunks/authThunks";

const AccountInfoSection = memo(({ authUser }) => (
  <div className="bg-base-100/80 backdrop-blur-sm rounded-2xl border border-base-300/50 p-6 sm:p-8 shadow-lg animate-slideUp" style={{ animationDelay: '0.2s' }}>
    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
      <Shield className="size-5 text-primary" />
      Account Information
    </h2>

    <div className="space-y-1">
      <div className="flex items-center justify-between p-4 rounded-xl hover:bg-base-200/50 transition-all duration-300 group">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Calendar className="size-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">Member Since</p>
            <p className="text-sm text-base-content/60">Account creation date</p>
          </div>
        </div>
        <span className="font-semibold text-primary">
          {authUser?.createdAt ? new Date(authUser.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }) : "N/A"}
        </span>
      </div>

      <div className="flex items-center justify-between p-4 rounded-xl hover:bg-base-200/50 transition-all duration-300 group">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-success/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Shield className="size-5 text-success" />
          </div>
          <div>
            <p className="font-medium">Account Status</p>
            <p className="text-sm text-base-content/60">Current account state</p>
          </div>
        </div>
        <span className="flex items-center gap-2 px-3 py-1.5 bg-success/10 text-success font-semibold rounded-full">
          <span className="size-2 bg-success rounded-full animate-pulse" />
          Active
        </span>
      </div>
    </div>
  </div>
));

const ProfilePage = () => {
  const dispatch = useDispatch();

  const authUser = useSelector((state) => state.auth?.authUser);
  const isUpdatingProfile = useSelector((state) => state.auth?.isUpdatingProfile);

  const [selectedImg, setSelectedImg] = useState(null);

  const handleImageUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      dispatch(updateProfile({ profilePic: base64Image }));
    };
  }, [dispatch]);

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-base-100 via-base-200/30 to-base-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="mb-8 animate-fadeIn">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
            Profile
          </h1>
          <p className="text-base-content/60">Manage your account information</p>
        </div>

        <div className="space-y-6">
          <div className="bg-base-100/80 backdrop-blur-sm rounded-2xl border border-base-300/50 p-8 shadow-lg animate-slideUp">
            <div className="flex flex-col items-center gap-6">
              <div className="relative group">
                <div className="relative">
                  <img
                    src={selectedImg || authUser?.profilePic || "/avatar.png"}
                    alt="Profile"
                    className="size-32 sm:size-40 rounded-full object-cover border-4 border-primary shadow-2xl ring-4 ring-primary/20 transition-all duration-300 group-hover:scale-105"
                  />
                  <div className="absolute bottom-2 right-2 size-6 bg-success rounded-full ring-4 ring-base-100 shadow-lg flex items-center justify-center">
                    <div className="size-3 bg-success rounded-full animate-pulse" />
                  </div>
                </div>

                <label
                  htmlFor="avatar-upload"
                  className={`
                    absolute bottom-0 right-0 
                    bg-gradient-to-br from-primary to-primary/80 hover:from-primary hover:to-primary/90
                    p-3 rounded-full cursor-pointer 
                    transition-all duration-300 shadow-lg
                    hover:scale-110 hover:shadow-xl
                    ${isUpdatingProfile ? "animate-pulse pointer-events-none opacity-50" : ""}
                  `}
                >
                  {isUpdatingProfile ? (
                    <Upload className="size-5 text-primary-content animate-bounce" />
                  ) : (
                    <Camera className="size-5 text-primary-content" />
                  )}
                  <input
                    type="file"
                    id="avatar-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUpdatingProfile}
                  />
                </label>
                <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/10 transition-all duration-300 pointer-events-none" />
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold mb-1">{authUser?.fullName}</p>
                <p className={`text-sm transition-all duration-300 ${isUpdatingProfile ? "text-primary font-medium" : "text-base-content/60"
                  }`}>
                  {isUpdatingProfile ? (
                    <span className="flex items-center gap-2 justify-center">
                      <span className="loading loading-spinner loading-xs"></span>
                      Uploading photo...
                    </span>
                  ) : (
                    "Click the camera icon to update your photo"
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-base-100/80 backdrop-blur-sm rounded-2xl border border-base-300/50 p-6 sm:p-8 shadow-lg animate-slideUp" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <User className="size-5 text-primary" />
              Personal Information
            </h2>

            <div className="space-y-5">
              <div className="group">
                <label className="text-sm font-medium text-base-content/60 flex items-center gap-2 mb-2">
                  <User className="size-4" />
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={authUser?.fullName || ""}
                    readOnly
                    className="w-full px-4 py-3 bg-base-200/50 rounded-xl border-2 border-base-300 transition-all duration-300 group-hover:border-primary/30 focus:outline-none cursor-default"
                  />
                </div>
              </div>

              <div className="group">
                <label className="text-sm font-medium text-base-content/60 flex items-center gap-2 mb-2">
                  <Mail className="size-4" />
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={authUser?.email || ""}
                    readOnly
                    className="w-full px-4 py-3 bg-base-200/50 rounded-xl border-2 border-base-300 transition-all duration-300 group-hover:border-primary/30 focus:outline-none cursor-default"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <CheckCircle className="size-5 text-success" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <AccountInfoSection authUser={authUser} />

        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        .animate-slideUp { animation: slideUp 0.6s ease-out forwards; opacity: 0; }
      `}</style>
    </div>
  );
};

export default ProfilePage;