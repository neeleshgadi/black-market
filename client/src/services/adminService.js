import api from "./api.js";

// Dashboard analytics
export const getDashboardAnalytics = async (days = 30) => {
  try {
    const response = await api.get(`/admin/analytics?days=${days}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Order management
export const getAllOrders = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();

    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== "") {
        queryParams.append(key, params[key]);
      }
    });

    const response = await api.get(`/admin/orders?${queryParams}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateOrderStatus = async (orderId, updateData) => {
  try {
    const response = await api.put(`/admin/orders/${orderId}`, updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// User management
export const getAllUsers = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();

    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== "") {
        queryParams.append(key, params[key]);
      }
    });

    const response = await api.get(`/admin/users?${queryParams}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateUserAdminStatus = async (userId, isAdmin) => {
  try {
    const response = await api.put(`/admin/users/${userId}/admin`, {
      isAdmin,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Alien management
export const getAllAliens = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();

    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== "") {
        queryParams.append(key, params[key]);
      }
    });

    const response = await api.get(`/admin/aliens?${queryParams}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createAlien = async (alienData) => {
  try {
    const formData = new FormData();

    // Append all alien data to FormData
    Object.keys(alienData).forEach((key) => {
      if (key === "abilities" && Array.isArray(alienData[key])) {
        alienData[key].forEach((ability, index) => {
          formData.append(`abilities[${index}]`, ability);
        });
      } else if (key === "image" && alienData[key] instanceof File) {
        formData.append("image", alienData[key]);
      } else if (alienData[key] !== undefined && alienData[key] !== "") {
        formData.append(key, alienData[key]);
      }
    });

    const response = await api.post("/admin/aliens", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateAlien = async (alienId, alienData) => {
  try {
    const formData = new FormData();

    // Append all alien data to FormData
    Object.keys(alienData).forEach((key) => {
      if (key === "abilities" && Array.isArray(alienData[key])) {
        alienData[key].forEach((ability, index) => {
          formData.append(`abilities[${index}]`, ability);
        });
      } else if (key === "image" && alienData[key] instanceof File) {
        formData.append("image", alienData[key]);
      } else if (alienData[key] !== undefined && alienData[key] !== "") {
        formData.append(key, alienData[key]);
      }
    });

    const response = await api.put(`/admin/aliens/${alienId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteAlien = async (alienId) => {
  try {
    const response = await api.delete(`/admin/aliens/${alienId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const toggleAlienFeatured = async (alienId, featured) => {
  try {
    const response = await api.put(`/admin/aliens/${alienId}/featured`, {
      featured,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const toggleAlienStock = async (alienId, inStock) => {
  try {
    const response = await api.put(`/admin/aliens/${alienId}/stock`, {
      inStock,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
// System metrics
export const getSystemMetrics = async () => {
  try {
    const response = await api.get("/admin/metrics");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Export all functions as a default object for easier importing
export const adminService = {
  getDashboardAnalytics,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  updateUserAdminStatus,
  getAllAliens,
  createAlien,
  updateAlien,
  deleteAlien,
  toggleAlienFeatured,
  toggleAlienStock,
  getSystemMetrics,
};
