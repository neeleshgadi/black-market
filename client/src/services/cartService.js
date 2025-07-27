import api from "./api";

const cartService = {
  // Get the cart
  getCart: async () => {
    try {
      const response = await api.get("/cart");
      return response.data;
    } catch (error) {
      console.error("Error getting cart:", error);
      return { success: false, error: error.message };
    }
  },

  // Add item to cart
  addToCart: async (alienId, quantity = 1) => {
    try {
      const response = await api.post("/cart/add", { alienId, quantity });
      return response.data;
    } catch (error) {
      console.error("Error adding to cart:", error);
      return { success: false, error: error.message };
    }
  },

  // Update item quantity
  updateQuantity: async (alienId, quantity) => {
    try {
      const response = await api.put(`/cart/update/${alienId}`, { quantity });
      return response.data;
    } catch (error) {
      console.error("Error updating quantity:", error);
      return { success: false, error: error.message };
    }
  },

  // Remove item from cart
  removeFromCart: async (alienId) => {
    try {
      const response = await api.delete(`/cart/remove/${alienId}`);
      return response.data;
    } catch (error) {
      console.error("Error removing from cart:", error);
      return { success: false, error: error.message };
    }
  },

  // Clear cart
  clearCart: async () => {
    try {
      const response = await api.delete("/cart/clear");
      return response.data;
    } catch (error) {
      console.error("Error clearing cart:", error);
      return { success: false, error: error.message };
    }
  },
};

export default cartService;
