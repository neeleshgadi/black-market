import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import fixedCartService from "../../utils/fixedCartService";

const FixedCartSummary = () => {
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

  const handleClearCart = async () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      try {
        await fixedCartService.clearCart();
        // Refresh cart
        const response = await fixedCartService.getCart();
        if (response.success) {
          setCart(response.data.cart);
        }
      } catch (err) {
        setError("Error clearing cart: " + err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50 sticky top-4">
        <p className="text-gray-400">Loading cart...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50 sticky top-4">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!cart) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50 sticky top-4">
        <p className="text-gray-400">Cart not available</p>
      </div>
    );
  }

  const subtotal = cart.totalPrice || 0;
  const shipping = subtotal > 100 ? 0 : 9.99; // Free shipping over $100
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;
  const totalItems = cart.totalItems || 0;

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50 sticky top-4">
      <h2 className="text-xl font-bold text-white mb-4">Order Summary</h2>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-gray-300">
          <span>Items ({totalItems})</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-gray-300">
          <span>Shipping</span>
          <span className={shipping === 0 ? "text-green-400" : ""}>
            {shipping === 0 ? "FREE" : `${shipping.toFixed(2)}`}
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

      {subtotal < 100 && (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 mb-4">
          <p className="text-blue-300 text-sm">
            💡 Add ${(100 - subtotal).toFixed(2)} more for free shipping!
          </p>
        </div>
      )}

      <div className="space-y-3">
        <Link
          to="/checkout"
          className="w-full bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-all text-center block"
        >
          Proceed to Checkout
        </Link>

        <Link
          to="/aliens"
          className="w-full bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white font-medium py-3 px-4 rounded-lg transition-all text-center block border border-gray-600"
        >
          Continue Shopping
        </Link>

        {cart.items.length > 0 && (
          <button
            onClick={handleClearCart}
            className="w-full text-red-400 hover:text-red-300 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
          >
            Clear Cart
          </button>
        )}
      </div>
    </div>
  );
};

export default FixedCartSummary;
