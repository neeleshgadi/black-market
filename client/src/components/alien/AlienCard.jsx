import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import WishlistButton from "../common/WishlistButton";
import LazyImage from "../common/LazyImage";

const AlienCard = ({ alien }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showSuccess, showError } = useToast();

  const handleViewDetails = () => {
    navigate(`/aliens/${alien._id}`);
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    try {
      await addToCart(alien, 1);
      showSuccess(`${alien.name} added to cart! 🛒`, { duration: 2000 });
    } catch (error) {
      showError(`Failed to add ${alien.name} to cart. Please try again.`);
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
    <div
      className="card-hover group cursor-pointer fade-in"
      onClick={handleViewDetails}
    >
      {/* Image Container */}
      <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden bg-gray-800 rounded-t-lg">
        <LazyImage
          src={alien.image}
          alt={alien.name}
          className="w-full h-full group-hover:scale-110 transition-transform duration-500"
          fallbackIcon={
            <div className="text-center">
              <svg
                className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 text-purple-400"
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
              <p className="text-purple-300 text-xs sm:text-sm font-medium px-2">
                {alien.name}
              </p>
            </div>
          }
        />

        {/* Hologram effect overlay */}
        <div className="absolute inset-0 hologram-effect opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Rarity Badge */}
        <div
          className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${getRarityColor(
            alien.rarity
          )} transition-all duration-200 group-hover:scale-110`}
        >
          {alien.rarity}
        </div>

        {/* Wishlist Button */}
        <div className="absolute top-2 left-2 transition-all duration-200 group-hover:scale-110">
          <WishlistButton alienId={alien._id} size="small" />
        </div>

        {/* Stock indicator */}
        {!alien.inStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="bg-red-600/90 text-white px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm">
              Out of Stock
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4">
        {/* Name */}
        <h3 className="text-lg sm:text-xl font-bold text-white mb-2 truncate group-hover:text-purple-300 transition-colors">
          {alien.name}
        </h3>

        {/* Faction and Planet */}
        <div className="space-y-1 mb-3 text-xs sm:text-sm">
          <p className="text-gray-300 truncate">
            <span className="text-purple-400 font-medium">Faction:</span>{" "}
            {alien.faction}
          </p>
          <p className="text-gray-300 truncate">
            <span className="text-green-400 font-medium">Planet:</span>{" "}
            {alien.planet}
          </p>
        </div>

        {/* Price */}
        <div className="mb-4">
          <span className="text-xl sm:text-2xl font-bold text-green-400 alien-glow">
            ${alien.price?.toFixed(2)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart(e);
            }}
            className={`
              flex-1 font-semibold py-2 px-3 rounded-lg transition-all duration-200 text-sm
              ${
                alien.inStock
                  ? "bg-purple-600 hover:bg-purple-700 text-white neon-glow hover:scale-105 focus-visible"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
              }
            `}
            disabled={!alien.inStock}
          >
            {alien.inStock ? "🛒 Add to Cart" : "❌ Out of Stock"}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails();
            }}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-200 hover:scale-105 focus-visible text-sm"
          >
            👁️ Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlienCard;
