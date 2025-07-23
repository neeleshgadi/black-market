import api from "./api";

// Get user's wishlist
export const getWishlist = async () => {
  try {
    const response = await api.get("/wishlist");
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to get wishlist" };
  }
};

// Add alien to wishlist
export const addToWishlist = async (alienId) => {
  try {
    const response = await api.post("/wishlist/add", { alienId });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to add to wishlist" };
  }
};

// Remove alien from wishlist
export const removeFromWishlist = async (alienId) => {
  try {
    const response = await api.delete(`/wishlist/remove/${alienId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to remove from wishlist" };
  }
};

// Check if alien is in wishlist
export const checkWishlistStatus = async (alienId) => {
  try {
    const response = await api.get(`/wishlist/check/${alienId}`);
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Failed to check wishlist status" }
    );
  }
};

// Clear entire wishlist
export const clearWishlist = async () => {
  try {
    const response = await api.delete("/wishlist/clear");
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to clear wishlist" };
  }
};
