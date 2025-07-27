import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  alien: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Alien",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    default: 1,
  },
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One cart per user
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

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

// Static method to get or create cart for user
cartSchema.statics.getOrCreateCart = async function (userId) {
  let cart = await this.findOne({ user: userId });
  if (!cart) {
    cart = new this({ user: userId, items: [] });
    await cart.save();
  }
  return cart;
};

// Instance method to add item
cartSchema.methods.addItem = async function (alienId, quantity = 1) {
  const existingItem = this.items.find((item) => item.alien.equals(alienId));

  if (existingItem) {
    existingItem.quantity = Math.min(existingItem.quantity + quantity, 10);
  } else {
    this.items.push({ alien: alienId, quantity: Math.min(quantity, 10) });
  }

  return this.save();
};

// Instance method to update item quantity
cartSchema.methods.updateItem = async function (alienId, quantity) {
  if (quantity <= 0) {
    this.items = this.items.filter((item) => !item.alien.equals(alienId));
  } else {
    const item = this.items.find((item) => item.alien.equals(alienId));
    if (item) {
      item.quantity = Math.min(quantity, 10);
    }
  }
  return this.save();
};

// Instance method to remove item
cartSchema.methods.removeItem = async function (alienId) {
  this.items = this.items.filter((item) => !item.alien.equals(alienId));
  return this.save();
};

// Instance method to clear cart
cartSchema.methods.clear = async function () {
  this.items = [];
  return this.save();
};

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
