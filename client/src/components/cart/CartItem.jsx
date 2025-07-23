import React, { useState } from "react";
import { useCart } from "../../context/CartContext";
import { getImageUrl } from "../../utils/imageUtils";

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;

    setIsUpdating(true);
    try {
      updateQuantity(item.alien._id, newQuantity);
    } catch (error) {
      console.error("Failed to update quantity:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = () => {
    setIsUpdating(true);
    try {
      removeFromCart(item.alien._id);
    } catch (error) {
      console.error("Failed to remove item:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const itemTotal = (item.alien.price * item.quantity).toFixed(2);

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 hover:border-purple-500/30 transition-all">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Alien Image */}
        <div className="flex-shrink-0">
          <img
            src={getImageUrl(item.alien.image)}
            alt={item.alien.name}
            className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border border-gray-600"
          />
        </div>

        {/* Item Details */}
        <div className="flex-grow">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">
                {item.alien.name}
              </h3>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="text-purple-400">{item.alien.faction}</span>
                <span className="text-gray-400">•</span>
                <span
                  className={`${
                    item.alien.rarity === "Legendary"
                      ? "text-yellow-400"
                      : item.alien.rarity === "Epic"
                      ? "text-purple-400"
                      : item.alien.rarity === "Rare"
                      ? "text-blue-400"
                      : "text-gray-400"
                  }`}
                >
                  {item.alien.rarity}
                </span>
              </div>
              <div className="text-green-400 font-semibold mt-1">
                ${item.alien.price.toFixed(2)} each
              </div>
            </div>

            {/* Price */}
            <div className="text-right">
              <div className="text-xl font-bold text-green-400">
                ${itemTotal}
              </div>
            </div>
          </div>

          {/* Quantity Controls and Remove Button */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mt-4">
            <div className="flex items-center gap-3">
              <span className="text-gray-300 text-sm">Quantity:</span>
              <div className="flex items-center bg-gray-700/50 rounded-lg border border-gray-600">
                <button
                  onClick={() => handleQuantityChange(item.quantity - 1)}
                  disabled={isUpdating || item.quantity <= 1}
                  className="px-3 py-1 text-gray-300 hover:text-white hover:bg-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-l-lg"
                >
                  −
                </button>
                <span className="px-4 py-1 text-white font-medium min-w-[3rem] text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(item.quantity + 1)}
                  disabled={isUpdating || item.quantity >= 10}
                  className="px-3 py-1 text-gray-300 hover:text-white hover:bg-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-r-lg"
                >
                  +
                </button>
              </div>
            </div>

            {/* Remove Button */}
            <button
              onClick={handleRemove}
              disabled={isUpdating}
              className="flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 border border-red-500/30 hover:border-red-400/50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              {isUpdating ? "Removing..." : "Remove"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
