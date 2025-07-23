import Order from "../models/Order.js";
import Alien from "../models/Alien.js";
import User from "../models/User.js";
import performanceMonitor from "../utils/performance.js";

// Get admin dashboard analytics
export const getDashboardAnalytics = async (req, res) => {
  try {
    // Get date range for analytics (default to last 30 days)
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get basic counts
    const [totalUsers, totalAliens, totalOrders, recentOrders] =
      await Promise.all([
        User.countDocuments(),
        Alien.countDocuments(),
        Order.countDocuments(),
        Order.countDocuments({ createdAt: { $gte: startDate } }),
      ]);

    // Get revenue analytics
    const revenueData = await Order.aggregate([
      {
        $match: {
          paymentStatus: "completed",
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          averageOrderValue: { $avg: "$totalAmount" },
        },
      },
    ]);

    // Get top selling aliens
    const topSellingAliens = await Order.aggregate([
      {
        $match: {
          paymentStatus: "completed",
          createdAt: { $gte: startDate },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.alien",
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.quantity", "$items.price"] },
          },
        },
      },
      {
        $lookup: {
          from: "aliens",
          localField: "_id",
          foreignField: "_id",
          as: "alien",
        },
      },
      { $unwind: "$alien" },
      {
        $project: {
          name: "$alien.name",
          image: "$alien.image",
          faction: "$alien.faction",
          totalSold: 1,
          totalRevenue: 1,
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    // Get recent orders
    const recentOrdersList = await Order.find()
      .populate("user", "firstName lastName email")
      .populate("items.alien", "name image price")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Get order status distribution
    const orderStatusDistribution = await Order.aggregate([
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get daily sales for the last 7 days
    const dailySales = await Order.aggregate([
      {
        $match: {
          paymentStatus: "completed",
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          sales: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const analytics = {
      overview: {
        totalUsers,
        totalAliens,
        totalOrders,
        recentOrders,
        totalRevenue: revenueData[0]?.totalRevenue || 0,
        averageOrderValue: revenueData[0]?.averageOrderValue || 0,
      },
      topSellingAliens,
      recentOrders: recentOrdersList.map((order) => ({
        id: order._id,
        orderNumber: order.orderNumber,
        customer: order.user
          ? `${order.user.firstName} ${order.user.lastName}`
          : "Guest",
        email: order.user?.email,
        totalAmount: order.totalAmount,
        status: order.orderStatus,
        paymentStatus: order.paymentStatus,
        itemCount: order.items.length,
        createdAt: order.createdAt,
      })),
      orderStatusDistribution,
      dailySales,
    };

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Error fetching dashboard analytics:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to fetch dashboard analytics",
        code: "ANALYTICS_ERROR",
      },
    });
  }
};

// Get all orders for admin management
export const getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      paymentStatus,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build query
    const query = {};

    if (status) {
      query.orderStatus = status;
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    // Search by order number or customer email
    if (search) {
      const users = await User.find({
        $or: [
          { email: { $regex: search, $options: "i" } },
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
        ],
      }).select("_id");

      query.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { user: { $in: users.map((u) => u._id) } },
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const [orders, totalCount] = await Promise.all([
      Order.find(query)
        .populate("user", "firstName lastName email")
        .populate("items.alien", "name image price faction")
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Order.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.status(200).json({
      success: true,
      data: {
        orders: orders.map((order) => ({
          id: order._id,
          orderNumber: order.orderNumber,
          customer: order.user
            ? `${order.user.firstName} ${order.user.lastName}`
            : "Guest",
          email: order.user?.email,
          items: order.items,
          totalAmount: order.totalAmount,
          orderStatus: order.orderStatus,
          paymentStatus: order.paymentStatus,
          shippingAddress: order.shippingAddress,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        })),
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to fetch orders",
        code: "ORDERS_FETCH_ERROR",
      },
    });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus, paymentStatus, notes } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Order not found",
          code: "ORDER_NOT_FOUND",
        },
      });
    }

    // Update fields if provided
    if (orderStatus) {
      order.orderStatus = orderStatus;
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    if (notes) {
      order.notes = notes;
    }

    await order.save();

    // Populate for response
    await order.populate("user", "firstName lastName email");
    await order.populate("items.alien", "name image price");

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: {
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          customer: order.user
            ? `${order.user.firstName} ${order.user.lastName}`
            : "Guest",
          email: order.user?.email,
          orderStatus: order.orderStatus,
          paymentStatus: order.paymentStatus,
          notes: order.notes,
          updatedAt: order.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to update order",
        code: "ORDER_UPDATE_ERROR",
      },
    });
  }
};

// Get all users for admin management
export const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      isAdmin,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build query
    const query = {};

    if (isAdmin !== undefined) {
      query.isAdmin = isAdmin === "true";
    }

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const [users, totalCount] = await Promise.all([
      User.find(query)
        .select("-password")
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.status(200).json({
      success: true,
      data: {
        users: users.map((user) => ({
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName:
            user.firstName && user.lastName
              ? `${user.firstName} ${user.lastName}`
              : user.firstName || user.lastName || "",
          isAdmin: user.isAdmin,
          wishlistCount: user.wishlist?.length || 0,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })),
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to fetch users",
        code: "USERS_FETCH_ERROR",
      },
    });
  }
};

// Update user admin status
export const updateUserAdminStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isAdmin } = req.body;

    // Prevent admin from removing their own admin status
    if (userId === req.user.id && !isAdmin) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Cannot remove your own admin privileges",
          code: "CANNOT_REMOVE_OWN_ADMIN",
        },
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isAdmin },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: "User not found",
          code: "USER_NOT_FOUND",
        },
      });
    }

    res.status(200).json({
      success: true,
      message: `User ${isAdmin ? "granted" : "revoked"} admin privileges`,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Error updating user admin status:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to update user admin status",
        code: "USER_UPDATE_ERROR",
      },
    });
  }
};
// Get all aliens for admin management
export const getAllAliens = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      faction,
      rarity,
      featured,
      inStock,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build query
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { faction: { $regex: search, $options: "i" } },
        { planet: { $regex: search, $options: "i" } },
      ];
    }

    if (faction) {
      query.faction = faction;
    }

    if (rarity) {
      query.rarity = rarity;
    }

    if (featured !== undefined) {
      query.featured = featured === "true";
    }

    if (inStock !== undefined) {
      query.inStock = inStock === "true";
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const [aliens, totalCount] = await Promise.all([
      Alien.find(query).sort(sortOptions).skip(skip).limit(limitNum).lean(),
      Alien.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.status(200).json({
      success: true,
      data: {
        aliens,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching all aliens:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to fetch aliens",
        code: "ALIENS_FETCH_ERROR",
      },
    });
  }
};

// Create new alien (admin only)
export const createAlien = async (req, res) => {
  try {
    const alienData = {
      ...req.body,
    };

    // Only set image if file was uploaded, otherwise use the image from req.body
    if (req.file) {
      alienData.image = `/uploads/${req.file.filename}`;
    }

    const alien = new Alien(alienData);
    await alien.save();

    res.status(201).json({
      success: true,
      message: "Alien created successfully",
      data: alien,
    });
  } catch (error) {
    console.error("Error creating alien:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: {
          message: "Validation error",
          code: "VALIDATION_ERROR",
          details: Object.values(error.errors).map((err) => err.message),
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        message: "Failed to create alien",
        code: "ALIEN_CREATE_ERROR",
      },
    });
  }
};

// Update alien (admin only)
export const updateAlien = async (req, res) => {
  try {
    const { alienId } = req.params;
    const updateData = { ...req.body };

    // Handle image upload
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const alien = await Alien.findByIdAndUpdate(alienId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!alien) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Alien not found",
          code: "ALIEN_NOT_FOUND",
        },
      });
    }

    res.status(200).json({
      success: true,
      message: "Alien updated successfully",
      data: alien,
    });
  } catch (error) {
    console.error("Error updating alien:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: {
          message: "Validation error",
          code: "VALIDATION_ERROR",
          details: Object.values(error.errors).map((err) => err.message),
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        message: "Failed to update alien",
        code: "ALIEN_UPDATE_ERROR",
      },
    });
  }
};

// Delete alien (admin only)
export const deleteAlien = async (req, res) => {
  try {
    const { alienId } = req.params;

    const alien = await Alien.findByIdAndDelete(alienId);

    if (!alien) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Alien not found",
          code: "ALIEN_NOT_FOUND",
        },
      });
    }

    res.status(200).json({
      success: true,
      message: "Alien deleted successfully",
      data: { deletedAlien: alien },
    });
  } catch (error) {
    console.error("Error deleting alien:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to delete alien",
        code: "ALIEN_DELETE_ERROR",
      },
    });
  }
};

// Toggle alien featured status
export const toggleAlienFeatured = async (req, res) => {
  try {
    const { alienId } = req.params;
    const { featured } = req.body;

    const alien = await Alien.findByIdAndUpdate(
      alienId,
      { featured },
      { new: true }
    );

    if (!alien) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Alien not found",
          code: "ALIEN_NOT_FOUND",
        },
      });
    }

    res.status(200).json({
      success: true,
      message: `Alien ${featured ? "featured" : "unfeatured"} successfully`,
      data: alien,
    });
  } catch (error) {
    console.error("Error toggling alien featured status:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to update alien featured status",
        code: "ALIEN_FEATURED_ERROR",
      },
    });
  }
};

// Toggle alien stock status
export const toggleAlienStock = async (req, res) => {
  try {
    const { alienId } = req.params;
    const { inStock } = req.body;

    const alien = await Alien.findByIdAndUpdate(
      alienId,
      { inStock },
      { new: true }
    );

    if (!alien) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Alien not found",
          code: "ALIEN_NOT_FOUND",
        },
      });
    }

    res.status(200).json({
      success: true,
      message: `Alien marked as ${
        inStock ? "in stock" : "out of stock"
      } successfully`,
      data: alien,
    });
  } catch (error) {
    console.error("Error toggling alien stock status:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to update alien stock status",
        code: "ALIEN_STOCK_ERROR",
      },
    });
  }
};

// Get system performance metrics
export const getSystemMetrics = async (req, res) => {
  try {
    // Get memory usage
    const memoryUsage = performanceMonitor.getMemoryUsage();

    // Get uptime
    const uptime = process.uptime();

    // Get basic system info
    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      pid: process.pid,
    };

    // Calculate average response time (mock data for now)
    // In a real implementation, you'd track this over time
    const avgResponseTime = Math.floor(Math.random() * 200) + 50; // 50-250ms

    // Get request count (mock data for now)
    // In a real implementation, you'd track this with middleware
    const requestCount = Math.floor(Math.random() * 10000) + 1000;

    const metrics = {
      responseTime: avgResponseTime,
      memoryUsage,
      uptime,
      requestCount,
      systemInfo,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error("Error fetching system metrics:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to fetch system metrics",
        code: "METRICS_ERROR",
      },
    });
  }
};
