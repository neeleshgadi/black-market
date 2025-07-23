import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";

const WishlistButton = ({ alienId, className = "", size = "medium" }) => {
  const { isAuthenticated } = useAuth();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isLoading, setIsLoading] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);

  useEffect(() => {
    if (isAuthenticated && alienId) {
      setInWishlist(isInWishlist(alienId));
    }
  }, [isAuthenticated, alienId, isInWishlist]);

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      // Could redirect to login or show login modal
      alert("Please sign in to add items to your wishlist");
      return;
    }

    setIsLoading(true);
    try {
      let result;
      if (inWishlist) {
        result = await removeFromWishlist(alienId);
      } else {
        result = await addToWishlist(alienId);
      }

      if (result.success) {
        setInWishlist(!inWishlist);
      } else {
        console.error("Wishlist operation failed:", result.message);
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return "w-8 h-8 text-sm";
      case "large":
        return "w-12 h-12 text-lg";
      default:
        return "w-10 h-10 text-base";
    }
  };

  const getIconSize = () => {
    switch (size) {
      case "small":
        return "w-4 h-4";
      case "large":
        return "w-6 h-6";
      default:
        return "w-5 h-5";
    }
  };

  return (
    <button
      onClick={handleToggleWishlist}
      disabled={isLoading}
      className={`
        ${getSizeClasses()}
        ${
          inWishlist
            ? "bg-red-600 hover:bg-red-700 text-white"
            : "bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white"
        }
        rounded-full flex items-center justify-center transition-all duration-200
        ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:scale-110"}
        ${className}
      `}
      title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full border-2 border-white border-t-transparent w-4 h-4"></div>
      ) : (
        <svg
          className={getIconSize()}
          fill={inWishlist ? "currentColor" : "none"}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={inWishlist ? 0 : 2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      )}
    </button>
  );
};

export default WishlistButton;
