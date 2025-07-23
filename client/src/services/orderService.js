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
};

export default orderService;
