import Cart from "../models/Cart.js";
import Alien from "../models/Alien.js";
import { validationResult } from "express-validator";

// Get user's cart
export const getCart = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: "Please login to view your cart",
          code: "LOGIN_REQUIRED",
        },
      });
    }

    const cart = await Cart.getOrCreateCart(req.user._id);
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
        code: "CART_ERROR",
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

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: "Please login to add items to cart",
          code: "LOGIN_REQUIRED",
        },
      });
    }

    const { alienId, quantity = 1 } = req.body;

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

    const cart = await Cart.getOrCreateCart(req.user._id);
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
        code: "CART_ERROR",
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

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: "Please login to update cart",
          code: "LOGIN_REQUIRED",
        },
      });
    }

    const { alienId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.getOrCreateCart(req.user._id);
    await cart.updateItem(alienId, quantity);
    await cart.populate(
      "items.alien",
      "name price image faction rarity inStock"
    );

    res.status(200).json({
      success: true,
      message: "Cart updated successfully",
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
    console.error("Update cart error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to update cart",
        code: "CART_ERROR",
      },
    });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: "Please login to remove items from cart",
          code: "LOGIN_REQUIRED",
        },
      });
    }

    const { alienId } = req.params;

    const cart = await Cart.getOrCreateCart(req.user._id);
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
        code: "CART_ERROR",
      },
    });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: "Please login to clear cart",
          code: "LOGIN_REQUIRED",
        },
      });
    }

    const cart = await Cart.getOrCreateCart(req.user._id);
    await cart.clear();

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
        code: "CART_ERROR",
      },
    });
  }
};
