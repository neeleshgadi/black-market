import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Alien from "../models/Alien.js";
import { validationResult } from "express-validator";

// Create new order
export const createOrder = async (req, res) => {
  try {
    console.log("Order creation request received:", {
      userId: req.user?.id,
      body: req.body,
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array());
      return res.status(400).json({
        success: false,
        error: {
          message: "Validation failed",
          code: "VALIDATION_ERROR",
          details: errors.array(),
        },
      });
    }

    const userId = req.user.id;
    const { shippingAddress, paymentMethod } = req.body;

    console.log("[ORDER DEBUG] Processing order for user:", userId);

    // Get user's cart
    console.log("[ORDER DEBUG] Finding cart for user:", userId);
    const cart = await Cart.findOne({ user: userId }).populate("items.alien");
    if (!cart) {
      console.log("[ORDER DEBUG] Cart not found for user:", userId);
    } else {
      console.log(
        `[ORDER DEBUG] Cart found for user: ${userId} with ${cart.items?.length || 0} items.`
      );
      console.log(`[ORDER DEBUG] Cart items:`, cart.items.map(i => ({alien: i.alien?._id || i.alien, name: i.alien?.name, quantity: i.quantity})));
    }

    // If cart doesn't exist, create an empty one
    if (!cart) {
      console.log("Creating new cart for user:", userId);
      const newCart = new Cart({ user: userId, items: [] });
      await newCart.save();

      return res.status(400).json({
        success: false,
        error: {
          message: "Cart is empty. Please add items before placing an order.",
          code: "EMPTY_CART",
        },
      });
    }

    // If cart exists but is empty
    if (cart.items.length === 0) {
      console.log("Cart is empty for user:", userId);
      return res.status(400).json({
        success: false,
        error: {
          message: "Cart is empty. Please add items before placing an order.",
          code: "EMPTY_CART",
        },
      });
    }

    console.log(`Processing ${cart.items.length} items in cart`);

    // Verify all items are still in stock and get current prices
    const orderItems = [];
    let totalAmount = 0;

    for (const cartItem of cart.items) {
      console.log(
        `Processing cart item: ${cartItem.alien._id}, quantity: ${cartItem.quantity}`
      );
      const alien = await Alien.findById(cartItem.alien._id);

      if (!alien) {
        console.log(`Alien ${cartItem.alien._id} not found`);
        return res.status(400).json({
          success: false,
          error: {
            message: `Alien ${cartItem.alien.name} is no longer available`,
            code: "ALIEN_UNAVAILABLE",
          },
        });
      }

      if (!alien.inStock) {
        console.log(`Alien ${alien.name} is out of stock`);
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
        price: alien.price, // Use current price
      };

      orderItems.push(orderItem);
      totalAmount += alien.price * cartItem.quantity;
    }

    console.log(
      `Creating order with ${orderItems.length} items, total: ${totalAmount}`
    );

    // Create the order
    const order = new Order({
      user: userId,
      items: orderItems,
      totalAmount: totalAmount,
      shippingAddress: shippingAddress,
      paymentStatus: "pending",
      orderStatus: "processing",
    });

    await order.save();
    console.log(`Order created with ID: ${order._id}`);

    // Simulate payment processing
    console.log("Processing payment...");
    const paymentResult = await processPayment(order, paymentMethod);
    console.log("Payment result:", paymentResult);

    if (paymentResult.success) {
      order.paymentStatus = "completed";
      order.orderStatus = "confirmed";
      await order.save();
      console.log("Payment successful, order confirmed");

      // Clear the cart after successful order
      await cart.clearCart();
      console.log("Cart cleared");
    } else {
      order.paymentStatus = "failed";
      await order.save();
      console.log("Payment failed:", paymentResult.error);

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
    console.log("Order populated with alien details");

    console.log("Sending successful order response");
    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: {
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          items: order.items,
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
        message: "Failed to create order",
        code: "ORDER_CREATION_ERROR",
      },
    });
  }
};

// Get user's orders
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
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
    const userId = req.user.id;

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
          totalAmount: order.totalAmount,
          shippingAddress: order.shippingAddress,
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus,
          notes: order.notes,
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

// Cancel order (only if payment is pending or order is processing)
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Order not found",
          code: "ORDER_NOT_FOUND",
        },
      });
    }

    // Check if order can be cancelled
    if (order.orderStatus === "shipped" || order.orderStatus === "delivered") {
      return res.status(400).json({
        success: false,
        error: {
          message: "Cannot cancel order that has been shipped or delivered",
          code: "CANNOT_CANCEL_ORDER",
        },
      });
    }

    if (order.orderStatus === "cancelled") {
      return res.status(400).json({
        success: false,
        error: {
          message: "Order is already cancelled",
          code: "ORDER_ALREADY_CANCELLED",
        },
      });
    }

    // Update order status
    order.orderStatus = "cancelled";

    // If payment was completed, mark for refund
    if (order.paymentStatus === "completed") {
      order.paymentStatus = "refunded";
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: {
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          orderStatus: order.orderStatus,
          paymentStatus: order.paymentStatus,
          updatedAt: order.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to cancel order",
        code: "ORDER_CANCELLATION_ERROR",
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
    if (paymentMethod.cardNumber === "4111111111111111") {
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

// Get order tracking information
export const getOrderTracking = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Order not found",
          code: "ORDER_NOT_FOUND",
        },
      });
    }

    // Generate tracking timeline based on order status
    const trackingTimeline = generateTrackingTimeline(order);

    res.status(200).json({
      success: true,
      data: {
        tracking: {
          orderNumber: order.orderNumber,
          currentStatus: order.orderStatus,
          paymentStatus: order.paymentStatus,
          timeline: trackingTimeline,
          estimatedDelivery: getEstimatedDelivery(order),
        },
      },
    });
  } catch (error) {
    console.error("Get order tracking error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to retrieve order tracking",
        code: "TRACKING_RETRIEVAL_ERROR",
      },
    });
  }
};

// Helper function to generate tracking timeline
const generateTrackingTimeline = (order) => {
  const timeline = [];
  const createdAt = new Date(order.createdAt);

  timeline.push({
    status: "processing",
    title: "Order Placed",
    description: "Your order has been received and is being processed",
    timestamp: createdAt,
    completed: true,
  });

  if (order.paymentStatus === "completed") {
    timeline.push({
      status: "confirmed",
      title: "Payment Confirmed",
      description: "Payment has been processed successfully",
      timestamp: new Date(createdAt.getTime() + 5 * 60 * 1000), // 5 minutes after order
      completed: true,
    });
  }

  if (
    order.orderStatus === "confirmed" ||
    order.orderStatus === "shipped" ||
    order.orderStatus === "delivered"
  ) {
    timeline.push({
      status: "confirmed",
      title: "Order Confirmed",
      description: "Your order has been confirmed and is being prepared",
      timestamp: new Date(createdAt.getTime() + 30 * 60 * 1000), // 30 minutes after order
      completed: true,
    });
  }

  if (order.orderStatus === "shipped" || order.orderStatus === "delivered") {
    timeline.push({
      status: "shipped",
      title: "Order Shipped",
      description: "Your order has been shipped and is on its way",
      timestamp: new Date(createdAt.getTime() + 24 * 60 * 60 * 1000), // 1 day after order
      completed: true,
    });
  }

  if (order.orderStatus === "delivered") {
    timeline.push({
      status: "delivered",
      title: "Order Delivered",
      description: "Your order has been delivered successfully",
      timestamp: new Date(createdAt.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days after order
      completed: true,
    });
  }

  if (order.orderStatus === "cancelled") {
    timeline.push({
      status: "cancelled",
      title: "Order Cancelled",
      description: "Your order has been cancelled",
      timestamp: order.updatedAt,
      completed: true,
    });
  }

  return timeline;
};

// Helper function to get estimated delivery date
const getEstimatedDelivery = (order) => {
  if (order.orderStatus === "delivered") {
    return null;
  }

  if (order.orderStatus === "cancelled") {
    return null;
  }

  const createdAt = new Date(order.createdAt);
  const estimatedDelivery = new Date(
    createdAt.getTime() + 5 * 24 * 60 * 60 * 1000
  ); // 5 days from order

  return estimatedDelivery;
};
