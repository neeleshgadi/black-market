import React, { useState, useEffect } from "react";
import fixedCartService from "../../utils/fixedCartService";

const FixedCartDebugger = () => {
  const [aliens, setAliens] = useState([]);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  // Load aliens and cart on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch aliens
        const response = await fetch("http://localhost:5000/api/aliens");
        const data = await response.json();
        if (data.success) {
          setAliens(data.data.aliens.slice(0, 5)); // Just get the first 5 aliens
        }

        // Fetch cart
        await refreshCart();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Refresh cart data
  const refreshCart = async () => {
    try {
      const cartData = await fixedCartService.getCart();
      if (cartData.success) {
        setCart(cartData.data.cart);
        setMessage("Cart refreshed successfully");
      }
    } catch (err) {
      setError("Failed to refresh cart: " + err.message);
    }
  };

  // Add alien to cart
  const handleAddToCart = async (alienId) => {
    try {
      setLoading(true);
      await fixedCartService.addToCart(alienId, 1);
      await refreshCart();
      setMessage(`Alien ${alienId} added to cart`);
    } catch (err) {
      setError("Failed to add to cart: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Remove alien from cart
  const handleRemoveFromCart = async (alienId) => {
    try {
      setLoading(true);
      await fixedCartService.removeFromCart(alienId);
      await refreshCart();
      setMessage(`Alien ${alienId} removed from cart`);
    } catch (err) {
      setError("Failed to remove from cart: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Clear cart
  const handleClearCart = async () => {
    try {
      setLoading(true);
      await fixedCartService.clearCart();
      await refreshCart();
      setMessage("Cart cleared");
    } catch (err) {
      setError("Failed to clear cart: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !cart) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-4">Fixed Cart Debugger</h2>
      <p className="text-gray-300 mb-4">
        Using fixed session ID: {fixedCartService.getSessionId()}
      </p>

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-4">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {message && (
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-4">
          <p className="text-green-300">{message}</p>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Cart</h3>
        {cart && (
          <div>
            <p className="text-gray-300">Cart ID: {cart.id}</p>
            <p className="text-gray-300">Items: {cart.items.length}</p>
            <p className="text-gray-300">
              Total: ${cart.totalPrice?.toFixed(2) || "0.00"}
            </p>

            {cart.items.length > 0 ? (
              <div className="mt-4">
                <h4 className="text-md font-semibold text-white mb-2">
                  Items in Cart
                </h4>
                <ul className="space-y-2">
                  {cart.items.map((item) => (
                    <li
                      key={item._id}
                      className="flex justify-between items-center bg-gray-700/50 p-3 rounded-lg"
                    >
                      <div>
                        <p className="text-white">{item.alien.name}</p>
                        <p className="text-gray-400">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveFromCart(item.alien._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={handleClearCart}
                  className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                >
                  Clear Cart
                </button>
              </div>
            ) : (
              <p className="text-gray-400 mt-2">Cart is empty</p>
            )}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Available Aliens
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {aliens.map((alien) => (
            <div key={alien._id} className="bg-gray-700/50 p-4 rounded-lg">
              <p className="text-white font-semibold">{alien.name}</p>
              <p className="text-gray-400">
                {alien.faction} • {alien.rarity}
              </p>
              <p className="text-green-400 font-semibold mt-1">
                ${alien.price}
              </p>
              <button
                onClick={() => handleAddToCart(alien._id)}
                className="mt-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg w-full"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={refreshCart}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Refresh Cart
        </button>
      </div>
    </div>
  );
};

export default FixedCartDebugger;
