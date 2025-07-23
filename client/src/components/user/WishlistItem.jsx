import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { getImageUrl } from "../../utils/imageUtils";

const WishlistItem = ({ alien }) => {
  const { addToCart } = useCart();
  const { removeFromWishlist } = useWishlist();

  const handleRemoveFromWishlist = async () => {
    const result = await removeFromWishlist(alien._id);
    if (result.success) {
      // Could add toast notification here
      console.log("Removed from wishlist");
    }
  };

  const handleAddToCart = () => {
    if (alien.inStock) {
      addToCart(alien, 1);
      // Could add toast notification here
      console.log("Added to cart");
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity?.toLowerCase()) {
      case "common":
        return "text-gray-400 bg-gray-800";
      case "rare":
        return "text-blue-400 bg-blue-900";
      case "epic":
        return "text-purple-400 bg-purple-900";
      case "legendary":
        return "text-yellow-400 bg-yellow-900";
      default:
        return "text-gray-400 bg-gray-800";
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-700 hover:border-purple-500/50">
      {/* Image Section */}
      <div className="relative aspect-square bg-gray-900">
        <Link to={`/aliens/${alien._id}`}>
          {alien.image ? (
            <img
              src={getImageUrl(alien.image)}
              alt={alien.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
          ) : null}

          {/* Fallback placeholder */}
          <div
            className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900 to-gray-900 ${
              alien.image ? "hidden" : "flex"
            }`}
            style={{ display: alien.image ? "none" : "flex" }}
          >
            <div className="text-center">
              <svg
                className="w-16 h-16 mx-auto mb-2 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <p className="text-purple-300 text-sm font-medium">
                {alien.name}
              </p>
            </div>
          </div>
        </Link>

        {/* Rarity Badge */}
        <div
          className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${getRarityColor(
            alien.rarity
          )}`}
        >
          {alien.rarity}
        </div>

        {/* Remove from Wishlist Button */}
        <button
          onClick={handleRemoveFromWishlist}
          className="absolute top-2 left-2 p-2 bg-red-600/80 hover:bg-red-600 text-white rounded-full transition-colors duration-200"
          title="Remove from wishlist"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M6 18L18 6M6 6l12 12"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Content Section */}
      <div className="p-4">
        <Link to={`/aliens/${alien._id}`}>
          <h3 className="text-lg font-bold text-white mb-2 hover:text-purple-400 transition-colors">
            {alien.name}
          </h3>
        </Link>

        <div className="space-y-2 mb-4">
          <p className="text-sm text-gray-400">
            <span className="text-purple-400">Faction:</span> {alien.faction}
          </p>
          <p className="text-sm text-gray-400">
            <span className="text-purple-400">Planet:</span> {alien.planet}
          </p>
        </div>

        {/* Price and Stock */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xl font-bold text-green-400">
            ${alien.price?.toFixed(2)}
          </span>
          <span
            className={`text-xs font-medium ${
              alien.inStock ? "text-green-400" : "text-red-400"
            }`}
          >
            {alien.inStock ? "In Stock" : "Out of Stock"}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={handleAddToCart}
            disabled={!alien.inStock}
            className={`flex-1 py-2 px-4 rounded font-semibold transition-colors duration-200 ${
              alien.inStock
                ? "bg-purple-600 hover:bg-purple-700 text-white"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }`}
          >
            {alien.inStock ? "Add to Cart" : "Out of Stock"}
          </button>
          <Link
            to={`/aliens/${alien._id}`}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-semibold transition-colors duration-200"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WishlistItem;
