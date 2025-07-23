console.log('[TOP OF CART MODEL] Cart.js loaded');
import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  alien: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Alien",
    required: [true, "Alien reference is required"],
  },
  quantity: {
    type: Number,
    required: [true, "Quantity is required"],
    min: [1, "Quantity must be at least 1"],
    max: [10, "Quantity cannot exceed 10 per item"],
    validate: {
      validator: Number.isInteger,
      message: "Quantity must be a whole number",
    },
  },
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    sessionId: {
      type: String,
      validate: {
        validator: function (value) {
          // Either user or sessionId must be present, but not both
          return (this.user && !value) || (!this.user && value);
        },
        message: "Cart must have either a user or sessionId, but not both",
      },
    },
    items: {
      type: [cartItemSchema],
      default: [],
      validate: {
        validator: function (items) {
          // Check for duplicate aliens in cart
          const alienIds = items.map((item) => item.alien.toString());
          return alienIds.length === new Set(alienIds).size;
        },
        message: "Cart cannot contain duplicate aliens",
      },
    },
    expiresAt: {
      type: Date,
      default: function () {
        // Guest carts expire after 7 days, user carts after 30 days
        const days = this.user ? 30 : 7;
        return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
cartSchema.index({ user: 1 }, { sparse: true });
cartSchema.index({ sessionId: 1 }, { sparse: true });
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
cartSchema.index({ updatedAt: -1 });

// Compound indexes
cartSchema.index({ user: 1, updatedAt: -1 });
cartSchema.index({ sessionId: 1, updatedAt: -1 });

// Virtual for total items count
cartSchema.virtual("totalItems").get(function () {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for total price (requires populated alien data)
cartSchema.virtual("totalPrice").get(function () {
  return this.items.reduce((total, item) => {
    if (item.alien && item.alien.price) {
      return total + item.alien.price * item.quantity;
    }
    return total;
  }, 0);
});

// Pre-save middleware to update expiration date
cartSchema.pre("save", function (next) {
  if (this.isModified("items") && this.items.length > 0) {
    // Reset expiration when cart is modified
    const days = this.user ? 30 : 7;
    this.expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }
  next();
});

// Instance method to add item to cart
cartSchema.methods.addItem = function (alienId, quantity = 1) {
  const existingItem = this.items.find((item) => item.alien.equals(alienId));

  if (existingItem) {
    existingItem.quantity = Math.min(existingItem.quantity + quantity, 10);
  } else {
    this.items.push({ alien: alienId, quantity: Math.min(quantity, 10) });
  }

  return this.save();
};

// Instance method to update item quantity
cartSchema.methods.updateItemQuantity = function (alienId, quantity) {
  const item = this.items.find((item) => item.alien.equals(alienId));

  if (item) {
    if (quantity <= 0) {
      this.items = this.items.filter((item) => !item.alien.equals(alienId));
    } else {
      item.quantity = Math.min(quantity, 10);
    }
  }

  return this.save();
};

// Instance method to remove item from cart
cartSchema.methods.removeItem = function (alienId) {
  this.items = this.items.filter((item) => !item.alien.equals(alienId));
  return this.save();
};

// Instance method to clear cart
cartSchema.methods.clearCart = function () {
  this.items = [];
  return this.save();
};

// Static method to find or create cart
cartSchema.statics.findOrCreateCart = async function (
  userId = null,
  sessionId = null
) {
  let cart;

  console.log(`Finding cart for userId: ${userId}, sessionId: ${sessionId}`);

  if (userId) {
    cart = await this.findOne({ user: userId });
    if (!cart) {
      console.log("Creating new cart for user:", userId);
      cart = new this({
        user: userId,
        items: [],
      });
      await cart.save();
    } else {
      console.log("Found existing cart for user:", userId);
    }
  } else if (sessionId) {
    // Log all carts to debug
    const allCarts = await this.find({}).limit(10);
    console.log(`All carts (${allCarts.length}):`);
    allCarts.forEach((c) =>
      console.log(
        `- Cart ID: ${c._id}, SessionID: ${c.sessionId}, Items: ${c.items.length}`
      )
    );

    // Try to find the cart with the exact session ID
    console.log(`Looking for cart with sessionId: "${sessionId}"`);
    cart = await this.findOne({ sessionId: sessionId });
    console.log(`Cart found: ${cart ? "Yes" : "No"}`);

    if (!cart) {
      console.log("Creating new cart for session:", sessionId);

      // Create a new cart with the session ID
      const newCart = new this({
        sessionId: sessionId,
        items: [],
      });

      try {
        await newCart.save();
        console.log(`New cart created with ID: ${newCart._id}`);

        // Double-check that the cart was saved correctly and use it
        const savedCart = await this.findOne({ sessionId: sessionId });
        if (savedCart) {
          console.log("Verified cart was saved with sessionId:", sessionId);
          cart = savedCart;
        } else {
          console.error("Failed to save cart with sessionId:", sessionId);
          // Create a temporary cart in memory as fallback
          cart = newCart;
        }
      } catch (error) {
        console.error("Error saving cart:", error);
        // Create a temporary cart in memory as fallback
        cart = newCart;
      }
    } else {
      console.log(
        "Found existing cart for session:",
        sessionId,
        "with",
        cart.items.length,
        "items"
      );
    }
  } else {
    console.error("No userId or sessionId provided");
  }

  return cart;
};

// Static method to merge guest cart with user cart
cartSchema.statics.mergeGuestCart = async function (userId, sessionId) {
  console.log('[METHOD] mergeGuestCart called with userId:', userId, 'guestSessionId:', sessionId);
  console.log('[MERGE DEBUG] mergeGuestCart called with userId:', userId, 'sessionId:', sessionId);
  let userCart = await this.findOne({ user: userId });
  let guestCart = await this.findOne({ sessionId: sessionId });
  console.log('[MERGE DEBUG] Before merge:');
  console.log('[MERGE DEBUG] userCart:', userCart ? {id: userCart._id, items: userCart.items.map(i => ({alien: i.alien, qty: i.quantity}))} : null);
  console.log('[MERGE DEBUG] guestCart:', guestCart ? {id: guestCart._id, items: guestCart.items.map(i => ({alien: i.alien, qty: i.quantity}))} : null);

  if (!guestCart || guestCart.items.length === 0) {
    console.log('[MERGE DEBUG] No guest cart or guest cart empty. Returning userCart.');
    return userCart;
  }

  if (!userCart) {
    // Convert guest cart to user cart
    guestCart.user = userId;
    // Robustly unset sessionId
    guestCart.sessionId = undefined;
    guestCart.set('sessionId', undefined, { strict: false });
    // Ensure only user or sessionId is set
    if (guestCart.sessionId !== undefined && guestCart.sessionId !== null) {
      delete guestCart.sessionId;
    }
    guestCart.markModified('items'); // Ensure items are persisted
    console.log('[MERGE DEBUG] Before save, guestCart:', JSON.stringify(guestCart));
    try {
      await guestCart.save();
      // After save, delete any duplicate guest carts with same sessionId
      await this.deleteMany({ sessionId: sessionId });
      // Re-fetch cart by userId to confirm items are present
      userCart = await this.findOne({ user: userId });
      console.log('[MERGE DEBUG] No userCart existed. Guest cart converted to userCart:', {id: userCart._id, items: userCart.items.map(i => ({alien: i.alien, qty: i.quantity}))});
    } catch (err) {
      console.error('[MERGE DEBUG] Error converting guest cart to user cart (in-place). Attempting fallback:', err);
      // Fallback: create new user cart, copy items, delete guest cart
      try {
        userCart = new this({ user: userId, items: guestCart.items });
        await userCart.save();
        await this.deleteMany({ sessionId: sessionId });
        console.log('[MERGE DEBUG] Fallback: Created new user cart and deleted guest cart. UserCart:', {id: userCart._id, items: userCart.items.map(i => ({alien: i.alien, qty: i.quantity}))});
      } catch (fallbackErr) {
        console.error('[MERGE DEBUG] Fallback also failed:', fallbackErr);
      }
    }
    return userCart;
  }

  // Merge items from guest cart to user cart (in-memory, then save ONCE)
  for (const guestItem of guestCart.items) {
    const existingItem = userCart.items.find(item => item.alien.equals(guestItem.alien));
    if (existingItem) {
      existingItem.quantity = Math.min(existingItem.quantity + guestItem.quantity, 10);
    } else {
      userCart.items.push({ alien: guestItem.alien, quantity: Math.min(guestItem.quantity, 10) });
    }
    console.log('[MERGE DEBUG] Prepared to add item to userCart:', {alien: guestItem.alien, qty: guestItem.quantity});
  }

  try {
    await userCart.save();
    // After save, delete the guest cart
    await this.deleteMany({ sessionId: sessionId });
    console.log('[MERGE DEBUG] userCart after adding guest items:', {id: userCart._id, items: userCart.items.map(i => ({alien: i.alien, qty: i.quantity}))});
    console.log('[MERGE DEBUG] Deleted guestCart(s) with sessionId:', sessionId);
  } catch (err) {
    console.error('[MERGE DEBUG] Error saving merged userCart or deleting guestCart:', err);
  }

  console.log('[MERGE DEBUG] mergeGuestCart returning cart:', userCart ? {id: userCart._id, items: userCart.items.map(i => ({alien: i.alien, qty: i.quantity}))} : null);
  return userCart;
}

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
