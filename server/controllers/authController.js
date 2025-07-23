import User from "../models/User.js";
import { generateToken } from "../middleware/auth.js";
import { AppError, asyncHandler } from "../middleware/errorHandler.js";
import logger from "../utils/logger.js";

// Register new user
export const register = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError(
      "User with this email already exists",
      409,
      "USER_EXISTS"
    );
  }

  // Create new user
  const user = new User({
    email,
    password,
    firstName,
    lastName,
  });

  await user.save();

  // Log registration event
  logger.logAuth("User registered", user._id, { email });

  // Generate token
  const token = generateToken(user._id);

  // Return user data without password
  const userData = {
    id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    isAdmin: user.isAdmin,
    createdAt: user.createdAt,
  };

  res.status(201).json({
    success: true,
    data: {
      user: userData,
      token,
    },
    message: "User registered successfully",
  });
});

// Login user
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user and include password for comparison
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    logger.logAuth("Login failed - user not found", null, { email });
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    logger.logAuth("Login failed - invalid password", user._id, { email });
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }

  // Log successful login
  logger.logAuth("User logged in", user._id, { email });

  // Generate token
  const token = generateToken(user._id);

  // Return user data without password
  const userData = {
    id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    isAdmin: user.isAdmin,
    createdAt: user.createdAt,
  };

  res.json({
    success: true,
    data: {
      user: userData,
      token,
    },
    message: "Login successful",
  });
});

// Get current user profile
export const getProfile = asyncHandler(async (req, res) => {
  const user = req.user;

  const userData = {
    id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    isAdmin: user.isAdmin,
    shippingAddress: user.shippingAddress,
    wishlist: user.wishlist,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  res.json({
    success: true,
    data: userData,
  });
});

// Update user profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, shippingAddress } = req.body;
  const userId = req.user._id;

  // Update user
  const user = await User.findByIdAndUpdate(
    userId,
    {
      firstName,
      lastName,
      shippingAddress,
    },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  logger.logAuth("Profile updated", userId);

  const userData = {
    id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    isAdmin: user.isAdmin,
    shippingAddress: user.shippingAddress,
    wishlist: user.wishlist,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  res.json({
    success: true,
    data: userData,
    message: "Profile updated successfully",
  });
});

// Change password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user._id;

  // Get user with password
  const user = await User.findById(userId).select("+password");
  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    logger.logAuth("Password change failed - invalid current password", userId);
    throw new AppError(
      "Current password is incorrect",
      401,
      "INVALID_CURRENT_PASSWORD"
    );
  }

  // Update password
  user.password = newPassword;
  await user.save();

  logger.logAuth("Password changed", userId);

  res.json({
    success: true,
    message: "Password changed successfully",
  });
});
