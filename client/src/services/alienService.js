import api from "./api.js";

// Get all aliens with filtering and pagination
export const getAliens = async (params = {}) => {
  try {
    const response = await api.get("/aliens", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get single alien by ID
export const getAlienById = async (id) => {
  try {
    const response = await api.get(`/aliens/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get related aliens
export const getRelatedAliens = async (id, limit = 4) => {
  try {
    const response = await api.get(`/aliens/${id}/related`, {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get featured aliens for homepage
export const getFeaturedAliens = async (limit = 6) => {
  try {
    const response = await api.get("/aliens/featured", {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get filter options
export const getFilterOptions = async () => {
  try {
    const response = await api.get("/aliens/filter-options");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Admin functions
export const createAlien = async (alienData) => {
  try {
    const response = await api.post("/aliens", alienData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateAlien = async (id, alienData) => {
  try {
    const response = await api.put(`/aliens/${id}`, alienData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteAlien = async (id) => {
  try {
    const response = await api.delete(`/aliens/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
