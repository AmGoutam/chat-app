import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, 
    },
    profilePic: {
      type: String,
      default: "",
    },
    lastSeen: {
      type: Date,
      default: Date.now,
      index: true, 
    },
  },
  { timestamps: true }
);

userSchema.index({ fullName: "text" });

userSchema.index({ lastSeen: -1, _id: 1 });

const User = mongoose.model("User", userSchema);

export default User;
