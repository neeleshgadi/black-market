import axios from "axios";

// Generate a consistent session ID that won't change between page refreshes
const getConsistentSessionId = () => {
  let sessionId = localStorage.getItem("cartSessionId");
  if (!sessionId) {
    sessionId = `cart_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 15)}`;
    localStorage.setItem("cartSessionId", sessionId);
    console.log("Created new persistent session ID:", sessionId);
  }
  return sessionId;
};

// Create an axios instance with the consistent session ID
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add the session ID to every request only if user is not logged in
function isLoggedIn() {
  return !!localStorage.getItem("token");
}

api.interceptors.request.use((config) => {
  if (!isLoggedIn()) {
    const sessionId = getConsistentSessionId();
    config.headers["X-Session-ID"] = sessionId;
  } else {
    // Ensure the header is not sent for authenticated users
    delete config.headers["X-Session-ID"];
  }
  return config;
});

const simpleCartService = {
  // Merge guest cart into authenticated user's cart
  mergeCart: async () => {
    try {
      // Use the session ID that is actually being used for guest cart requests
      let guestSessionId = localStorage.getItem("cartSessionId");
      // If fixedCartMiddleware is active, override with the fixed session ID
      if (typeof window !== 'undefined' && window.FIXED_CART_SESSION_ID) {
        guestSessionId = window.FIXED_CART_SESSION_ID || "fixed_cart_session_id_123";
      } else if (!guestSessionId) {
        guestSessionId = "fixed_cart_session_id_123";
      }
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await api.post("/cart/merge", { guestSessionId }, { headers });
      return response.data;
    } catch (error) {
      console.error("Error merging guest cart:", error);
      return { success: false, error: error.message };
    }
  },
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

export default simpleCartService;
