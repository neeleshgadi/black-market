import api from "./api.js";

// Generate a session ID for guest users
const getOrCreateSessionId = () => {
  let sessionId = localStorage.getItem("sessionId");
  if (!sessionId) {
    sessionId =
      "guest_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem("sessionId", sessionId);
    console.log("Created new session ID:", sessionId);
  } else {
    console.log("Using existing session ID:", sessionId);
  }
  return sessionId;
};

const cartService = {
  // Get user's cart
  getCart: async () => {
    try {
      const sessionId = getOrCreateSessionId();
      const response = await api.get("/cart", {
        headers: {
          "X-Session-ID": sessionId,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Add item to cart
  addToCart: async (alienId, quantity = 1) => {
    try {
      const sessionId = getOrCreateSessionId();
      console.log(
        `Adding item ${alienId} with quantity ${quantity} to cart with session ID ${sessionId}`
      );
      const response = await api.post(
        "/cart/add",
        { alienId, quantity },
        {
          headers: {
            "X-Session-ID": sessionId,
          },
        }
      );
      console.log("Add to cart response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error.response?.data || error;
    }
  },

  // Update cart item quantity
  updateCartItem: async (alienId, quantity) => {
    try {
      const sessionId = getOrCreateSessionId();
      const response = await api.put(
        `/cart/update/${alienId}`,
        { quantity },
        {
          headers: {
            "X-Session-ID": sessionId,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Remove item from cart
  removeFromCart: async (alienId) => {
    try {
      const sessionId = getOrCreateSessionId();
      const response = await api.delete(`/cart/remove/${alienId}`, {
        headers: {
          "X-Session-ID": sessionId,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Clear entire cart
  clearCart: async () => {
    try {
      const sessionId = getOrCreateSessionId();
      const response = await api.delete("/cart/clear", {
        headers: {
          "X-Session-ID": sessionId,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Merge guest cart with user cart (after login)
  mergeCart: async (sessionId) => {
    try {
      const response = await api.post("/cart/merge", { sessionId });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default cartService;
