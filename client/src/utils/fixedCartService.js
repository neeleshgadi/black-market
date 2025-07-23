import axios from "axios";

// Use a fixed session ID for all requests
const FIXED_SESSION_ID = "fixed_cart_session_id_123";

// Create an axios instance specifically for cart operations
const cartApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    "X-Session-ID": FIXED_SESSION_ID,
  },
  withCredentials: true, // For cookies
});

// Fixed cart service functions
const fixedCartService = {
  // Get the current cart
  getCart: async () => {
    try {
      console.log(
        "Fixed cart service - fetching cart with session ID:",
        FIXED_SESSION_ID
      );
      const response = await cartApi.get("/cart");
      console.log("Fixed cart service - getCart response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Fixed cart service - getCart error:", error);
      throw error;
    }
  },

  // Add an item to the cart
  addToCart: async (alienId, quantity = 1) => {
    try {
      console.log(
        `Fixed cart service - adding alien ${alienId} to cart, quantity: ${quantity}`
      );
      const response = await cartApi.post("/cart/add", { alienId, quantity });
      console.log("Fixed cart service - addToCart response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Fixed cart service - addToCart error:", error);
      throw error;
    }
  },

  // Update an item's quantity
  updateQuantity: async (alienId, quantity) => {
    try {
      console.log(
        `Fixed cart service - updating alien ${alienId} quantity to ${quantity}`
      );
      const response = await cartApi.put(`/cart/update/${alienId}`, {
        quantity,
      });
      console.log(
        "Fixed cart service - updateQuantity response:",
        response.data
      );
      return response.data;
    } catch (error) {
      console.error("Fixed cart service - updateQuantity error:", error);
      throw error;
    }
  },

  // Remove an item from the cart
  removeFromCart: async (alienId) => {
    try {
      console.log(`Fixed cart service - removing alien ${alienId} from cart`);
      const response = await cartApi.delete(`/cart/remove/${alienId}`);
      console.log(
        "Fixed cart service - removeFromCart response:",
        response.data
      );
      return response.data;
    } catch (error) {
      console.error("Fixed cart service - removeFromCart error:", error);
      throw error;
    }
  },

  // Clear the cart
  clearCart: async () => {
    try {
      console.log("Fixed cart service - clearing cart");
      const response = await cartApi.delete("/cart/clear");
      console.log("Fixed cart service - clearCart response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Fixed cart service - clearCart error:", error);
      throw error;
    }
  },

  // Get the session ID
  getSessionId: () => FIXED_SESSION_ID,
};

export default fixedCartService;
