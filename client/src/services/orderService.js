import api from "./api";

const orderService = {
  // Create a new order
  createOrder: async (orderData) => {
    try {
      console.log("Creating order with data:", orderData);
      const response = await api.post("/orders", orderData);
      console.log("Order creation response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Order creation error:", error);
      console.error("Response data:", error.response?.data);
      console.error("Request config:", error.config);
      throw error;
    }
  },

  // Get user's orders
  getUserOrders: async () => {
    try {
      const response = await api.get("/orders");
      return response.data;
    } catch (error) {
      console.error("Get orders error:", error);
      throw error;
    }
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error(`Get order ${orderId} error:`, error);
      throw error;
    }
  },

  // Get order tracking information
  getOrderTracking: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}/tracking`);
      return response.data;
    } catch (error) {
      console.error(`Get order tracking ${orderId} error:`, error);
      throw error;
    }
  },

  // Cancel an order
  cancelOrder: async (orderId) => {
    try {
      const response = await api.put(`/orders/${orderId}/cancel`);
      return response.data;
    } catch (error) {
      console.error(`Cancel order ${orderId} error:`, error);
      throw error;
    }
  },
};

// Export individual functions for named imports
export const {
  createOrder,
  getUserOrders,
  getOrderById,
  getOrderTracking,
  cancelOrder,
} = orderService;

export default orderService;
