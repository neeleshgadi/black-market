import { validationResult } from "express-validator";
import User from "../models/User.js";
import Alien from "../models/Alien.js";

// Get user's wishlist
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find user and populate wishlist with alien details
    const user = await User.findById(userId).populate({
      path: "wishlist",
      select: "name faction planet rarity price image inStock featured",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: "User not found",
          code: "USER_NOT_FOUND",
        },
      });
    }

    res.json({
      success: true,
      data: {
        wishlist: user.wishlist,
        count: user.wishlist.length,
      },
    });
  } catch (error) {
    console.error("Get wishlist error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to get wishlist",
        code: "WISHLIST_ERROR",
      },
    });
  }
};

// Add alien to wishlist
export const addToWishlist = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Validation failed",
          code: "VALIDATION_ERROR",
          details: errors.array(),
        },
      });
    }

    const { alienId } = req.body;
    const userId = req.user._id;

    // Check if alien exists
    const alien = await Alien.findById(alienId);
    if (!alien) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Alien not found",
          code: "ALIEN_NOT_FOUND",
        },
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: "User not found",
          code: "USER_NOT_FOUND",
        },
      });
    }

    // Check if alien is already in wishlist
    if (user.wishlist.includes(alienId)) {
      return res.status(409).json({
        success: false,
        error: {
          message: "Alien is already in wishlist",
          code: "ALREADY_IN_WISHLIST",
        },
      });
    }

    // Add to wishlist using the model method
    await user.addToWishlist(alienId);

    // Get updated user with populated wishlist
    const updatedUser = await User.findById(userId).populate({
      path: "wishlist",
      select: "name faction planet rarity price image inStock featured",
    });

    res.status(201).json({
      success: true,
      data: {
        wishlist: updatedUser.wishlist,
        count: updatedUser.wishlist.length,
      },
      message: "Alien added to wishlist successfully",
    });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to add alien to wishlist",
        code: "ADD_WISHLIST_ERROR",
      },
    });
  }
};

// Remove alien from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    // Check for validation errors first
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Validation failed",
          code: "VALIDATION_ERROR",
          details: errors.array(),
        },
      });
    }

    const { alienId } = req.params;
    const userId = req.user._id;

    // Check if alien exists
    const alien = await Alien.findById(alienId);
    if (!alien) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Alien not found",
          code: "ALIEN_NOT_FOUND",
        },
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: "User not found",
          code: "USER_NOT_FOUND",
        },
      });
    }

    // Check if alien is in wishlist
    if (!user.wishlist.includes(alienId)) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Alien not found in wishlist",
          code: "NOT_IN_WISHLIST",
        },
      });
    }

    // Remove from wishlist using the model method
    await user.removeFromWishlist(alienId);

    // Get updated user with populated wishlist
    const updatedUser = await User.findById(userId).populate({
      path: "wishlist",
      select: "name faction planet rarity price image inStock featured",
    });

    res.json({
      success: true,
      data: {
        wishlist: updatedUser.wishlist,
        count: updatedUser.wishlist.length,
      },
      message: "Alien removed from wishlist successfully",
    });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to remove alien from wishlist",
        code: "REMOVE_WISHLIST_ERROR",
      },
    });
  }
};

// Check if alien is in user's wishlist
export const checkWishlistStatus = async (req, res) => {
  try {
    // Check for validation errors first
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Validation failed",
          code: "VALIDATION_ERROR",
          details: errors.array(),
        },
      });
    }

    const { alienId } = req.params;
    const userId = req.user._id;

    // Check if alien exists
    const alien = await Alien.findById(alienId);
    if (!alien) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Alien not found",
          code: "ALIEN_NOT_FOUND",
        },
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: "User not found",
          code: "USER_NOT_FOUND",
        },
      });
    }

    const isInWishlist = user.wishlist.includes(alienId);

    res.json({
      success: true,
      data: {
        isInWishlist,
        alienId,
      },
    });
  } catch (error) {
    console.error("Check wishlist status error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to check wishlist status",
        code: "WISHLIST_STATUS_ERROR",
      },
    });
  }
};

// Clear entire wishlist
export const clearWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find user and clear wishlist
    const user = await User.findByIdAndUpdate(
      userId,
      { wishlist: [] },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: "User not found",
          code: "USER_NOT_FOUND",
        },
      });
    }

    res.json({
      success: true,
      data: {
        wishlist: [],
        count: 0,
      },
      message: "Wishlist cleared successfully",
    });
  } catch (error) {
    console.error("Clear wishlist error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to clear wishlist",
        code: "CLEAR_WISHLIST_ERROR",
      },
    });
  }
};
