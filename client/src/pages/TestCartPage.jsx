import React, { useState, useEffect } from "react";
import fixedCartService from "../utils/fixedCartService";

const TestCartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aliens, setAliens] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch aliens
        const apiUrl =
          import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const aliensResponse = await fetch(`${apiUrl}/aliens`);
        const aliensData = await aliensResponse.json();
        if (aliensData.success) {
          setAliens(aliensData.data.aliens.slice(0, 3));
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

  const refreshCart = async () => {
    try {
      setMessage("Fetching cart...");
      const response = await fixedCartService.getCart();
      setMessage("Cart fetched successfully");
      if (response.success) {
        setCart(response.data.cart);
      } else {
        setError(
          "Failed to fetch cart: " +
            (response.error?.message || "Unknown error")
        );
      }
    } catch (err) {
      setError("Error fetching cart: " + err.message);
    }
  };

  const handleAddToCart = async (alienId) => {
    try {
      setMessage(`Adding alien ${alienId} to cart...`);
      await fixedCartService.addToCart(alienId, 1);
      setMessage(`Alien ${alienId} added to cart`);
      await refreshCart();
    } catch (err) {
      setError("Error adding to cart: " + err.message);
    }
  };

  const handleClearCart = async () => {
    try {
      setMessage("Clearing cart...");
      await fixedCartService.clearCart();
      setMessage("Cart cleared");
      await refreshCart();
    } catch (err) {
      setError("Error clearing cart: " + err.message);
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Test Cart Page</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {message && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Cart</h2>
        {cart ? (
          <div>
            <p>Cart ID: {cart.id}</p>
            <p>Items: {cart.items.length}</p>
            <p>Total: ${cart.totalPrice?.toFixed(2) || "0.00"}</p>

            {cart.items.length > 0 ? (
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Items in Cart</h3>
                <ul className="list-disc pl-5">
                  {cart.items.map((item) => (
                    <li key={item._id}>
                      {item.alien.name} - Quantity: {item.quantity} - $
                      {(item.alien.price * item.quantity).toFixed(2)}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={handleClearCart}
                  className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                >
                  Clear Cart
                </button>
              </div>
            ) : (
              <p className="mt-2">Cart is empty</p>
            )}
          </div>
        ) : (
          <p>No cart data available</p>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Available Aliens</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {aliens.map((alien) => (
            <div key={alien._id} className="border p-4 rounded">
              <p className="font-medium">{alien.name}</p>
              <p>
                {alien.faction} • {alien.rarity}
              </p>
              <p className="text-green-600 font-semibold">${alien.price}</p>
              <button
                onClick={() => handleAddToCart(alien._id)}
                className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full"
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
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          Refresh Cart
        </button>
      </div>
    </div>
  );
};

export default TestCartPage;
