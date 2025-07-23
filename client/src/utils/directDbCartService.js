import axios from "axios";

// This service directly fetches the fixed cart from the database
// It's a simplified version that only gets the cart, doesn't modify it

const directDbCartService = {
  // Get the fixed cart directly from the database
  getFixedCart: async () => {
    try {
      const apiUrl =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await axios.get(`${apiUrl}/cart/fixed`);
      return response.data;
    } catch (error) {
      console.error("Error fetching fixed cart:", error);
      throw error;
    }
  },
};

export default directDbCartService;
