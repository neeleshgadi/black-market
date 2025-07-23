import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import CheckoutForm from "../components/checkout/CheckoutForm";
import OrderSummary from "../components/checkout/OrderSummary";
import LoadingSpinner from "../components/common/LoadingSpinner";
import orderService from "../services/orderService";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, clearCart, getCartTotal, getCartItemCount, isLoading } =
    useCart();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  // Redirect if cart is empty (but only after loading is complete)
  useEffect(() => {
    if (!isLoading && items.length === 0) {
      navigate("/cart");
    }
  }, [items.length, navigate, isLoading]);

  const handleOrderSubmit = async (formData) => {
    setIsProcessing(true);
    setError("");

    try {
      // Create order with shipping address and payment method only
      // The server will get the items from the user's cart
      const orderData = {
        shippingAddress: formData.shippingAddress,
        paymentMethod: formData.paymentMethod,
      };

      const response = await orderService.createOrder(orderData);

      if (response.success) {
        // Clear cart and redirect to confirmation
        clearCart();
        navigate(
          `/order-confirmation/${
            response.data.order.id || response.data.order._id
          }`,
          {
            state: { order: response.data.order },
          }
        );
      }
    } catch (error) {
      console.error("Order processing error:", error);
      console.error("Order error details:", error.response?.data);

      // Handle specific error cases
      if (error.response?.data?.error?.code === "EMPTY_CART") {
        setError(
          "Your cart is empty. Please add items before placing an order."
        );
      } else if (error.response?.status === 404) {
        setError(
          "Order service is currently unavailable. Please try again later."
        );
      } else {
        setError(
          error.response?.data?.error?.message ||
            error.message ||
            "Failed to process your order. Please try again."
        );
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (items.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>

        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 text-red-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-300">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <CheckoutForm
              onSubmit={handleOrderSubmit}
              isProcessing={isProcessing}
              user={user}
            />
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary items={items} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
