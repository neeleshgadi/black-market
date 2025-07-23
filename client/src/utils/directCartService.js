import axios from "axios";

// Create a consistent session ID that won't change between page refreshes
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

// Create an axios instance specifically for cart operations
const cartApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // For cookies
});

// Add the session ID to every request
cartApi.interceptors.request.use((config) => {
  const sessionId = getConsistentSessionId();
  config.headers["X-Session-ID"] = sessionId;
  return config;
});

// Direct cart service functions
const directCartService = {
  // Get the current cart
  getCart: async () => {
    try {
      const response = await cartApi.get("/cart");
      console.log("Direct cart service - getCart response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Direct cart service - getCart error:", error);
      throw error;
    }
  },

  // Add an item to the cart
  addToCart: async (alienId, quantity = 1) => {
    try {
      console.log(
        `Direct cart service - adding alien ${alienId} to cart, quantity: ${quantity}`
      );
      const response = await cartApi.post("/cart/add", { alienId, quantity });
      console.log("Direct cart service - addToCart response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Direct cart service - addToCart error:", error);
      throw error;
    }
  },

  // Update an item's quantity
  updateQuantity: async (alienId, quantity) => {
    try {
      console.log(
        `Direct cart service - updating alien ${alienId} quantity to ${quantity}`
      );
      const response = await cartApi.put(`/cart/update/${alienId}`, {
        quantity,
      });
      console.log(
        "Direct cart service - updateQuantity response:",
        response.data
      );
      return response.data;
    } catch (error) {
      console.error("Direct cart service - updateQuantity error:", error);
      throw error;
    }
  },

  // Remove an item from the cart
  removeFromCart: async (alienId) => {
    try {
      console.log(`Direct cart service - removing alien ${alienId} from cart`);
      const response = await cartApi.delete(`/cart/remove/${alienId}`);
      console.log(
        "Direct cart service - removeFromCart response:",
        response.data
      );
      return response.data;
    } catch (error) {
      console.error("Direct cart service - removeFromCart error:", error);
      throw error;
    }
  },

  // Clear the cart
  clearCart: async () => {
    try {
      console.log("Direct cart service - clearing cart");
      const response = await cartApi.delete("/cart/clear");
      console.log("Direct cart service - clearCart response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Direct cart service - clearCart error:", error);
      throw error;
    }
  },

  // Get the current session ID
  getSessionId: getConsistentSessionId,
};

export default directCartService;
