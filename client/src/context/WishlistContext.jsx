import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import * as wishlistService from "../services/wishlistService";

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  // Load wishlist when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadWishlist();
    } else {
      setWishlist([]);
    }
  }, [isAuthenticated]);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await wishlistService.getWishlist();
      setWishlist(response.data.wishlist || []);
    } catch (err) {
      console.error("Error loading wishlist:", err);
      setError(err.message || "Failed to load wishlist");
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (alienId) => {
    try {
      setError(null);
      const response = await wishlistService.addToWishlist(alienId);
      setWishlist(response.data.wishlist || []);
      return { success: true, message: response.message };
    } catch (err) {
      console.error("Error adding to wishlist:", err);
      const errorMessage = err.message || "Failed to add to wishlist";
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const removeFromWishlist = async (alienId) => {
    try {
      setError(null);
      const response = await wishlistService.removeFromWishlist(alienId);
      setWishlist(response.data.wishlist || []);
      return { success: true, message: response.message };
    } catch (err) {
      console.error("Error removing from wishlist:", err);
      const errorMessage = err.message || "Failed to remove from wishlist";
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const isInWishlist = (alienId) => {
    return wishlist.some((alien) => alien._id === alienId);
  };

  const getWishlistCount = () => {
    return wishlist.length;
  };

  const clearWishlist = async () => {
    try {
      setError(null);
      const response = await wishlistService.clearWishlist();
      setWishlist([]);
      return { success: true, message: response.message };
    } catch (err) {
      console.error("Error clearing wishlist:", err);
      const errorMessage = err.message || "Failed to clear wishlist";
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const value = {
    wishlist,
    loading,
    error,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    getWishlistCount,
    clearWishlist,
    loadWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
