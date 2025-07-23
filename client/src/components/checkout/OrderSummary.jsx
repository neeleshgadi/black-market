import React from "react";
import { getImageUrl } from "../../utils/imageUtils";

const OrderSummary = ({ items }) => {
  const subtotal = items.reduce(
    (total, item) => total + item.alien.price * item.quantity,
    0
  );
  const shipping = subtotal > 100 ? 0 : 9.99; // Free shipping over $100
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50 sticky top-4">
      <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>

      {/* Order Items */}
      <div className="space-y-4 mb-6">
        {items.map((item) => {
          // Handle both client-side and server-side cart item formats
          const alien = item.alien;
          const quantity = item.quantity;

          if (!alien || !alien._id) {
            return null; // Skip invalid items
          }

          return (
            <div key={alien._id} className="flex gap-3">
              <div className="flex-shrink-0">
                <img
                  src={getImageUrl(alien.image)}
                  alt={alien.name}
                  className="w-12 h-12 object-cover rounded-lg border border-gray-600"
                />
              </div>
              <div className="flex-grow min-w-0">
                <h3 className="text-sm font-medium text-white truncate">
                  {alien.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{alien.faction}</span>
                  <span>•</span>
                  <span
                    className={`${
                      alien.rarity === "Legendary"
                        ? "text-yellow-400"
                        : alien.rarity === "Epic"
                        ? "text-purple-400"
                        : alien.rarity === "Rare"
                        ? "text-blue-400"
                        : "text-gray-400"
                    }`}
                  >
                    {alien.rarity}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-400">Qty: {quantity}</span>
                  <span className="text-sm font-medium text-green-400">
                    ${(alien.price * quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <hr className="border-gray-600 mb-4" />

      {/* Price Breakdown */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-gray-300">
          <span>
            Subtotal ({items.reduce((total, item) => total + item.quantity, 0)}{" "}
            items)
          </span>
          <span>${subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-gray-300">
          <span>Shipping</span>
          <span className={shipping === 0 ? "text-green-400" : ""}>
            {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
          </span>
        </div>

        <div className="flex justify-between text-gray-300">
          <span>Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>

        <hr className="border-gray-600" />

        <div className="flex justify-between text-lg font-bold text-white">
          <span>Total</span>
          <span className="text-green-400">${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Free Shipping Notice */}
      {subtotal < 100 && (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 mb-4">
          <p className="text-blue-300 text-sm">
            💡 Add ${(100 - subtotal).toFixed(2)} more for free shipping!
          </p>
        </div>
      )}

      {/* Security Notice */}
      <div className="bg-gray-700/30 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <svg
            className="w-4 h-4 text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span className="text-sm font-medium text-green-400">
            Secure Checkout
          </span>
        </div>
        <p className="text-xs text-gray-400">
          Your payment information is protected with 256-bit SSL encryption.
        </p>
      </div>
    </div>
  );
};

export default OrderSummary;
