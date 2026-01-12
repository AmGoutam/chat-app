import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import generateToken from "../utils/utils.js";
import cloudinary from "../lib/cloudinary.js";

// ********************* Signup *********************
const signup = async (req, res) => {
  const { fullName, email, password, profilePic } = req.body;

  try {
    // 1. Check if user exists - Use .lean() for faster, read-only lookup
    const userExists = await User.findOne({ email }).select("_id").lean();
    if (userExists)
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });

    // 2. Hash password - Higher salt rounds = more secure but slower; 10 is the production sweet spot
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Handle Profile Picture with Eager Transformation
    let profilePicUrl = "";
    if (profilePic) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(profilePic, {
          folder: "profile_pics",
          // OPTIMIZATION: Automatically resize and compress on the fly
          transformation: [
            { width: 200, height: 200, crop: "fill", quality: "auto" },
          ],
        });
        profilePicUrl = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary Error:", uploadError.message);
      }
    }

    // 4. Create user
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      profilePic: profilePicUrl,
    });

    // 5. Generate JWT and return lean response
    generateToken(newUser._id, res);

    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
    });
  } catch (error) {
    console.error("Signup Error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ********************* Login *********************
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // OPTIMIZATION: Use .lean() to return a plain JS object, bypassing Mongoose overhead
    const user = await User.findOne({ email }).select("+password").lean();

    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });

    generateToken(user._id, res);

    // Filter sensitive fields manually since we used .lean()
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ********************* updateProfile *********************
const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic)
      return res
        .status(400)
        .json({ success: false, message: "Profile pic is required" });

    // Upload with optimization to improve LCP on frontend
    const uploadResponse = await cloudinary.uploader.upload(profilePic, {
      folder: "profile_pics",
      transformation: [
        { width: 300, height: 300, crop: "thumb", gravity: "face" },
      ],
    });

    // OPTIMIZATION: findByIdAndUpdate with { lean: true } is faster for simple updates
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true, lean: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const logout = (req, res) => {
  res.cookie("jwt", "", { maxAge: 0 });
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

const checkAuth = (req, res) => {
  res.status(200).json(req.user);
};

export { signup, login, logout, updateProfile, checkAuth };
