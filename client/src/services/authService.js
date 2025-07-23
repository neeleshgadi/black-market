import api from "./api";

const authService = {
  // Login user
  login: async (email, password) => {
    try {
      console.log("Attempting login with:", { email });
      const response = await api.post("/auth/login", { email, password });
      console.log("Login response:", response.data);

      if (response.data.success) {
        const { token } = response.data.data;
        localStorage.setItem("token", token);
      }

      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      console.error("Error response:", error.response?.data);
      throw error;
    }
  },

  // Register user
  register: async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);

      if (response.data.success) {
        const { token } = response.data.data;
        localStorage.setItem("token", token);
      }

      return response.data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get("/auth/profile");
      return response.data;
    } catch (error) {
      console.error("Get profile error:", error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put("/auth/profile", profileData);
      return response.data;
    } catch (error) {
      console.error("Update profile error:", error);
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

  // Set auth token in axios headers
  setAuthToken: (token) => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("token", token);
    } else {
      delete api.defaults.headers.common["Authorization"];
      localStorage.removeItem("token");
    }
  },
};

export default authService;
