console.log('[TOP OF CARTCONTROLLER] cartController.js loaded');
import Cart from "../models/Cart.js";
import Alien from "../models/Alien.js";
import { validationResult } from "express-validator";

// Helper function to get session ID from request
const getSessionId = (req) => {
  // Get session ID from header (case-insensitive)
  const headerSessionId =
    req.headers["x-session-id"] || req.headers["X-Session-ID"];

  // Use header session ID if available, otherwise use express session ID
  const sessionId = headerSessionId || req.sessionID || req.session?.id;

  console.log(`Using session ID: ${sessionId}`);
  return sessionId;
};

// Get user's cart
export const getCart = async (req, res) => {
  console.log('[HANDLER] getCart called');
  try {
    const userId = req.user?.id;
    const sessionId = getSessionId(req);

    console.log(`[getCart] Using sessionId: ${sessionId}`);

    if (!userId && !sessionId) {
      console.error("[getCart] No userId or sessionId provided");
      return res.status(400).json({
        success: false,
        error: {
          message: "User ID or session ID is required",
          code: "MISSING_IDENTIFIER",
        },
      });
    }

    const cart = await Cart.findOrCreateCart(userId, sessionId);
    await cart.populate(
      "items.alien",
      "name price image faction rarity inStock"
    );

    res.status(200).json({
      success: true,
      data: {
        cart: {
          id: cart._id,
          items: cart.items,
          totalItems: cart.totalItems,
          totalPrice: cart.totalPrice,
          updatedAt: cart.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to retrieve cart",
        code: "CART_RETRIEVAL_ERROR",
      },
    });
  }
};

// Add item to cart
export const addToCart = async (req, res) => {
  try {
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

    const { alienId, quantity = 1 } = req.body;
    const userId = req.user?.id;
    const sessionId = getSessionId(req);

    if (!userId && !sessionId) {
      return res.status(400).json({
        success: false,
        error: {
          message: "User ID or session ID is required",
          code: "MISSING_IDENTIFIER",
        },
      });
    }

    // Check if alien exists and is in stock
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

    if (!alien.inStock) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Alien is out of stock",
          code: "OUT_OF_STOCK",
        },
      });
    }

    const cart = await Cart.findOrCreateCart(userId, sessionId);
    await cart.addItem(alienId, quantity);
    await cart.populate(
      "items.alien",
      "name price image faction rarity inStock"
    );

    res.status(200).json({
      success: true,
      message: "Item added to cart successfully",
      data: {
        cart: {
          id: cart._id,
          items: cart.items,
          totalItems: cart.totalItems,
          totalPrice: cart.totalPrice,
          updatedAt: cart.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to add item to cart",
        code: "ADD_TO_CART_ERROR",
      },
    });
  }
};

// Update cart item quantity
export const updateCartItem = async (req, res) => {
  try {
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
    const { quantity } = req.body;
    const userId = req.user?.id;
    const sessionId = getSessionId(req);

    if (!userId && !sessionId) {
      return res.status(400).json({
        success: false,
        error: {
          message: "User ID or session ID is required",
          code: "MISSING_IDENTIFIER",
        },
      });
    }

    const cart = await Cart.findOrCreateCart(userId, sessionId);
    await cart.updateItemQuantity(alienId, quantity);
    await cart.populate(
      "items.alien",
      "name price image faction rarity inStock"
    );

    res.status(200).json({
      success: true,
      message: "Cart item updated successfully",
      data: {
        cart: {
          id: cart._id,
          items: cart.items,
          totalItems: cart.totalItems,
          totalPrice: cart.totalPrice,
          updatedAt: cart.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Update cart item error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to update cart item",
        code: "UPDATE_CART_ERROR",
      },
    });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const { alienId } = req.params;
    const userId = req.user?.id;
    const sessionId = getSessionId(req);

    if (!userId && !sessionId) {
      return res.status(400).json({
        success: false,
        error: {
          message: "User ID or session ID is required",
          code: "MISSING_IDENTIFIER",
        },
      });
    }

    const cart = await Cart.findOrCreateCart(userId, sessionId);
    await cart.removeItem(alienId);
    await cart.populate(
      "items.alien",
      "name price image faction rarity inStock"
    );

    res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
      data: {
        cart: {
          id: cart._id,
          items: cart.items,
          totalItems: cart.totalItems,
          totalPrice: cart.totalPrice,
          updatedAt: cart.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to remove item from cart",
        code: "REMOVE_FROM_CART_ERROR",
      },
    });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    const sessionId = getSessionId(req);

    if (!userId && !sessionId) {
      return res.status(400).json({
        success: false,
        error: {
          message: "User ID or session ID is required",
          code: "MISSING_IDENTIFIER",
        },
      });
    }

    const cart = await Cart.findOrCreateCart(userId, sessionId);
    await cart.clearCart();

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      data: {
        cart: {
          id: cart._id,
          items: [],
          totalItems: 0,
          totalPrice: 0,
          updatedAt: cart.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to clear cart",
        code: "CLEAR_CART_ERROR",
      },
    });
  }
};

// Merge guest cart with user cart (called after login)
export const mergeCart = async (req, res) => {
  console.log('[HANDLER] mergeCart called');
  try {
    const userId = req.user.id;
    // Accept both guestSessionId and sessionId for compatibility
    const guestSessionId = req.body.guestSessionId || req.body.sessionId;

    if (!guestSessionId) {
      console.error('[MERGE DEBUG] Missing guestSessionId in mergeCart request body:', req.body);
      return res.status(400).json({
        success: false,
        error: {
          message: "Guest session ID is required for cart merge",
          code: "MISSING_SESSION_ID",
        },
      });
    }

    console.log('[MERGE DEBUG] mergeCart called for user:', userId, 'with guestSessionId:', guestSessionId);
    // Extra debug
    console.log(`[MERGE DEBUG] req.user:`, req.user);
    console.log(`[MERGE DEBUG] req.headers:`, req.headers);
    const cart = await Cart.mergeGuestCart(userId, guestSessionId);
    await cart.populate(
      "items.alien",
      "name price image faction rarity inStock"
    );

    res.status(200).json({
      success: true,
      message: "Cart merged successfully",
      data: {
        cart: {
          id: cart._id,
          items: cart.items,
          totalItems: cart.totalItems,
          totalPrice: cart.totalPrice,
          updatedAt: cart.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("[MERGE DEBUG] Merge cart error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to merge cart",
        code: "MERGE_CART_ERROR",
      },
    });
  }
};
