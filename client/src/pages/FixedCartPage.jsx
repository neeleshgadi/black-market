import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import fixedCartService from "../utils/fixedCartService";
import FixedCartSummary from "../components/cart/FixedCartSummary";
import LoadingSpinner from "../components/common/LoadingSpinner";

const FixedCartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        const response = await fixedCartService.getCart();
        if (response.success) {
          setCart(response.data.cart);
        } else {
          setError("Failed to load cart");
        }
      } catch (err) {
        setError("Error loading cart: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const handleRemoveItem = async (alienId) => {
    try {
      await fixedCartService.removeFromCart(alienId);
      // Refresh cart
      const response = await fixedCartService.getCart();
      if (response.success) {
        setCart(response.data.cart);
      }
    } catch (err) {
      setError("Error removing item: " + err.message);
    }
  };

  const handleUpdateQuantity = async (alienId, quantity) => {
    try {
      await fixedCartService.updateQuantity(alienId, quantity);
      // Refresh cart
      const response = await fixedCartService.getCart();
      if (response.success) {
        setCart(response.data.cart);
      }
    } catch (err) {
      setError("Error updating quantity: " + err.message);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Shopping Cart</h1>
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-4">
            <p className="text-red-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Shopping Cart</h1>

          <div className="bg-gray-800/50 rounded-lg p-8 border border-gray-700/50 text-center">
            <div className="text-6xl mb-4">🛸</div>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-400 mb-6">
              Looks like you haven't added any alien collectibles to your cart
              yet. Start exploring the galaxy!
            </p>
            <Link
              to="/aliens"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Explore Aliens
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Shopping Cart</h1>
          <div className="text-gray-400">
            {cart.totalItems} {cart.totalItems === 1 ? "item" : "items"}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item._id}
                  className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 hover:border-purple-500/30 transition-all"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Alien Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.alien.image}
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
                            <span className="text-purple-400">
                              {item.alien.faction}
                            </span>
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
                            ${(item.alien.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {/* Quantity Controls and Remove Button */}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mt-4">
                        <div className="flex items-center gap-3">
                          <span className="text-gray-300 text-sm">
                            Quantity:
                          </span>
                          <div className="flex items-center bg-gray-700/50 rounded-lg border border-gray-600">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.alien._id,
                                  item.quantity - 1
                                )
                              }
                              disabled={item.quantity <= 1}
                              className="px-3 py-1 text-gray-300 hover:text-white hover:bg-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-l-lg"
                            >
                              −
                            </button>
                            <span className="px-4 py-1 text-white font-medium min-w-[3rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.alien._id,
                                  item.quantity + 1
                                )
                              }
                              disabled={item.quantity >= 10}
                              className="px-3 py-1 text-gray-300 hover:text-white hover:bg-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-r-lg"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(item.alien._id)}
                          className="flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 border border-red-500/30 hover:border-red-400/50 rounded-lg transition-all"
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
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <FixedCartSummary />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FixedCartPage;
