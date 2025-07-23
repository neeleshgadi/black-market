/**
 * Direct Auth Service - Uses fetch API directly to bypass any issues with axios
 */

const BASE_URL = "http://localhost:5000/api";

const directAuthService = {
  // Login user
  login: async (email, password) => {
    try {
      console.log("Direct login attempt with:", email);

      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await response.json();
      console.log("Direct login response:", data);

      if (data.success && data.data.token) {
        localStorage.setItem("token", data.data.token);
      }

      return data;
    } catch (error) {
      console.error("Direct login error:", error);
      throw error;
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      const response = await fetch(`${BASE_URL}/auth/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Get profile error:", error);
      throw error;
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem("token");
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  // Get token
  getToken: () => {
    return localStorage.getItem("token");
  },
};

export default directAuthService;
