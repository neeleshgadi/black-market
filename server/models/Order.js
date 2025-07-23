import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  alien: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Alien",
    required: [true, "Alien reference is required"],
  },
  quantity: {
    type: Number,
    required: [true, "Quantity is required"],
    min: [1, "Quantity must be at least 1"],
    validate: {
      validator: Number.isInteger,
      message: "Quantity must be a whole number",
    },
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [0, "Price cannot be negative"],
    validate: {
      validator: function (value) {
        return Number.isFinite(value) && value >= 0;
      },
      message: "Price must be a valid positive number",
    },
  },
});

const shippingAddressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: [true, "Street address is required"],
    trim: true,
    maxlength: [100, "Street address cannot exceed 100 characters"],
  },
  city: {
    type: String,
    required: [true, "City is required"],
    trim: true,
    maxlength: [50, "City cannot exceed 50 characters"],
  },
  state: {
    type: String,
    required: [true, "State is required"],
    trim: true,
    maxlength: [50, "State cannot exceed 50 characters"],
  },
  zipCode: {
    type: String,
    required: [true, "Zip code is required"],
    trim: true,
    maxlength: [20, "Zip code cannot exceed 20 characters"],
  },
  country: {
    type: String,
    required: [true, "Country is required"],
    trim: true,
    maxlength: [50, "Country cannot exceed 50 characters"],
  },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    items: {
      type: [orderItemSchema],
      required: [true, "Order items are required"],
      validate: {
        validator: function (items) {
          return items && items.length > 0;
        },
        message: "Order must contain at least one item",
      },
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
      validate: {
        validator: function (value) {
          return Number.isFinite(value) && value >= 0;
        },
        message: "Total amount must be a valid positive number",
      },
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: [true, "Shipping address is required"],
    },
    paymentStatus: {
      type: String,
      required: [true, "Payment status is required"],
      enum: {
        values: ["pending", "completed", "failed", "refunded"],
        message:
          "Payment status must be pending, completed, failed, or refunded",
      },
      default: "pending",
    },
    orderStatus: {
      type: String,
      required: [true, "Order status is required"],
      enum: {
        values: [
          "processing",
          "confirmed",
          "shipped",
          "delivered",
          "cancelled",
        ],
        message:
          "Order status must be processing, confirmed, shipped, delivered, or cancelled",
      },
      default: "processing",
    },
    orderNumber: {
      type: String,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
orderSchema.index({ user: 1 });
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ user: 1, createdAt: -1 });

// Virtual for order total calculation
orderSchema.virtual("calculatedTotal").get(function () {
  return this.items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
});

// Pre-save middleware to generate order number
orderSchema.pre("save", function (next) {
  if (this.isNew && !this.orderNumber) {
    // Generate order number: BM + timestamp + random 4 digits
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(1000 + Math.random() * 9000);
    this.orderNumber = `BM${timestamp}${random}`;
  }
  next();
});

// Pre-save middleware to validate total amount
orderSchema.pre("save", function (next) {
  const calculatedTotal = this.calculatedTotal;
  if (Math.abs(this.totalAmount - calculatedTotal) > 0.01) {
    return next(new Error("Total amount does not match calculated total"));
  }
  next();
});

// Instance method to update order status
orderSchema.methods.updateStatus = function (newStatus, notes = "") {
  this.orderStatus = newStatus;
  if (notes) {
    this.notes = notes;
  }
  return this.save();
};

// Instance method to update payment status
orderSchema.methods.updatePaymentStatus = function (newStatus) {
  this.paymentStatus = newStatus;
  return this.save();
};

const Order = mongoose.model("Order", orderSchema);

export default Order;
