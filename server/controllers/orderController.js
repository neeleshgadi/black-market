import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Alien from "../models/Alien.js";
import { validationResult } from "express-validator";

// Create new order
export const createOrder = async (req, res) => {
  try {
    console.log("Order creation request received for user:", req.user._id);

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

    const userId = req.user._id;
    const { shippingAddress, paymentMethod } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: userId }).populate("items.alien");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Cart is empty. Please add items before placing an order.",
          code: "EMPTY_CART",
        },
      });
    }

    console.log(`Processing ${cart.items.length} items in cart`);

    // Verify all items are still in stock and calculate totals
    const orderItems = [];
    let subtotal = 0;

    for (const cartItem of cart.items) {
      const alien = await Alien.findById(cartItem.alien._id);

      if (!alien) {
        return res.status(400).json({
          success: false,
          error: {
            message: `Alien ${cartItem.alien.name} is no longer available`,
            code: "ALIEN_UNAVAILABLE",
          },
        });
      }

      if (!alien.inStock) {
        return res.status(400).json({
          success: false,
          error: {
            message: `Alien ${alien.name} is out of stock`,
            code: "OUT_OF_STOCK",
          },
        });
      }

      const orderItem = {
        alien: alien._id,
        quantity: cartItem.quantity,
        price: alien.price,
      };

      orderItems.push(orderItem);
      subtotal += alien.price * cartItem.quantity;
    }

    // Calculate tax and shipping
    const shipping = subtotal > 100 ? 0 : 9.99;
    const tax = subtotal * 0.08; // 8% tax
    const totalAmount = subtotal + shipping + tax;

    console.log(
      `Creating order: subtotal=${subtotal}, tax=${tax}, shipping=${shipping}, total=${totalAmount}`
    );

    // Create the order
    const order = new Order({
      user: userId,
      items: orderItems,
      subtotal: subtotal,
      tax: tax,
      shipping: shipping,
      totalAmount: totalAmount,
      shippingAddress: shippingAddress,
      paymentStatus: "pending",
      orderStatus: "processing",
    });

    await order.save();
    console.log(`Order created with ID: ${order._id}`);

    // Process payment
    const paymentResult = await processPayment(order, paymentMethod);

    if (paymentResult.success) {
      order.paymentStatus = "completed";
      order.orderStatus = "confirmed";
      await order.save();

      // Clear the cart after successful order
      await cart.clear();
      console.log("Cart cleared after successful order");
    } else {
      order.paymentStatus = "failed";
      await order.save();

      return res.status(400).json({
        success: false,
        error: {
          message: "Payment processing failed",
          code: "PAYMENT_FAILED",
          details: paymentResult.error,
        },
      });
    }

    // Populate order details for response
    await order.populate("items.alien", "name price image faction rarity");

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: {
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          items: order.items,
          subtotal: order.subtotal,
          tax: order.tax,
          shipping: order.shipping,
          totalAmount: order.totalAmount,
          shippingAddress: order.shippingAddress,
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus,
          createdAt: order.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to create order: " + error.message,
        code: "ORDER_CREATION_ERROR",
      },
    });
  }
};

// Get user's orders
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: userId })
      .populate("items.alien", "name price image faction rarity")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments({ user: userId });
    const totalPages = Math.ceil(totalOrders / limit);

    res.status(200).json({
      success: true,
      data: {
        orders: orders.map((order) => ({
          id: order._id,
          orderNumber: order.orderNumber,
          items: order.items,
          subtotal: order.subtotal,
          tax: order.tax,
          shipping: order.shipping,
          totalAmount: order.totalAmount,
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus,
          createdAt: order.createdAt,
        })),
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalOrders: totalOrders,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get user orders error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to retrieve orders",
        code: "ORDER_RETRIEVAL_ERROR",
      },
    });
  }
};

// Get specific order details
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    const order = await Order.findOne({ _id: orderId, user: userId }).populate(
      "items.alien",
      "name price image faction rarity planet backstory"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Order not found",
          code: "ORDER_NOT_FOUND",
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          items: order.items,
          subtotal: order.subtotal,
          tax: order.tax,
          shipping: order.shipping,
          totalAmount: order.totalAmount,
          shippingAddress: order.shippingAddress,
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Get order by ID error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to retrieve order",
        code: "ORDER_RETRIEVAL_ERROR",
      },
    });
  }
};

// Mock payment processing function
const processPayment = async (order, paymentMethod) => {
  try {
    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock payment validation
    if (
      !paymentMethod ||
      !paymentMethod.cardNumber ||
      !paymentMethod.expiryDate ||
      !paymentMethod.cvv
    ) {
      return {
        success: false,
        error: "Invalid payment method details",
      };
    }

    // For testing purposes, always succeed with test card number
    if (paymentMethod.cardNumber.replace(/\s/g, "") === "4111111111111111") {
      return {
        success: true,
        transactionId: `txn_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 9)}`,
        amount: order.totalAmount,
        currency: "USD",
      };
    }

    // Simulate random payment failures (10% chance) for non-test cards
    if (Math.random() < 0.1) {
      return {
        success: false,
        error: "Payment declined by bank",
      };
    }

    // Mock successful payment
    return {
      success: true,
      transactionId: `txn_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}`,
      amount: order.totalAmount,
      currency: "USD",
    };
  } catch (error) {
    console.error("Payment processing error:", error);
    return {
      success: false,
      error: "Payment processing error: " + (error.message || "Unknown error"),
    };
  }
};
