import React, { useState, useEffect } from "react";
import directDbCartService from "../utils/directDbCartService";

const DirectDbCartTestPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        console.log("Fetching fixed cart directly from database...");
        const response = await directDbCartService.getFixedCart();
        console.log("Direct DB cart response:", response);

        if (response.success && response.data.cart) {
          setCart(response.data.cart);
        } else {
          setError(
            "Failed to fetch cart: " +
              (response.error?.message || "Unknown error")
          );
        }
      } catch (err) {
        setError("Error fetching cart: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Direct DB Cart Test Page</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
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
              </div>
            ) : (
              <p className="mt-2">Cart is empty</p>
            )}
          </div>
        ) : (
          <p>No cart data available</p>
        )}
      </div>

      <div className="mt-6">
        <button
          onClick={() => window.location.reload()}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          Refresh
        </button>
      </div>
    </div>
  );
};

export default DirectDbCartTestPage;
