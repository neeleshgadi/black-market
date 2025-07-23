import React, { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { getImageUrl } from "../utils/imageUtils";
import LoadingSpinner from "../components/common/LoadingSpinner";
import api from "../services/api";

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!order && orderId) {
      fetchOrderDetails();
    }
  }, [orderId, order]);

  const fetchOrderDetails = async () => {
    try {
      const response = await api.get(`/api/orders/${orderId}`);

      if (response.data.success) {
        setOrder(response.data.data.order);
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      setError(
        error.response?.data?.error?.message ||
          error.message ||
          "Failed to fetch order details"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-8">
            <svg
              className="w-16 h-16 text-red-400 mx-auto mb-4"
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
            <h1 className="text-2xl font-bold text-white mb-4">
              Error Loading Order
            </h1>
            <p className="text-red-300 mb-6">{error}</p>
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
            >
              View Order History
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gray-800/50 rounded-lg p-8 border border-gray-700/50">
            <h1 className="text-2xl font-bold text-white mb-4">
              Order Not Found
            </h1>
            <p className="text-gray-400 mb-6">
              We couldn't find the order you're looking for.
            </p>
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
            >
              View Order History
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-8 mb-6">
            <svg
              className="w-16 h-16 text-green-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h1 className="text-3xl font-bold text-white mb-2">
              Order Confirmed!
            </h1>
            <p className="text-green-300 text-lg">
              Thank you for your purchase from the Black Market
            </p>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-gray-400 text-sm">Order Number</p>
                <p className="text-white font-semibold text-lg">
                  {order.orderNumber}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Order Date</p>
                <p className="text-white font-semibold text-lg">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Amount</p>
                <p className="text-green-400 font-semibold text-lg">
                  ${order.totalAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Items */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
            <h2 className="text-xl font-bold text-white mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-4 p-4 bg-gray-700/30 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    <img
                      src={getImageUrl(item.alien.image)}
                      alt={item.alien.name}
                      className="w-16 h-16 object-cover rounded-lg border border-gray-600"
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-white font-semibold">
                      {item.alien.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                      <span>{item.alien.faction}</span>
                      <span>•</span>
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
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-400">
                        Qty: {item.quantity}
                      </span>
                      <span className="text-green-400 font-semibold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping & Payment Info */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
              <h2 className="text-xl font-bold text-white mb-4">
                Shipping Address
              </h2>
              <div className="text-gray-300 space-y-1">
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.zipCode}
                </p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>

            {/* Order Status */}
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
              <h2 className="text-xl font-bold text-white mb-4">
                Order Status
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Payment Status</span>
                  <span
                    className={`font-semibold ${
                      order.paymentStatus === "completed"
                        ? "text-green-400"
                        : order.paymentStatus === "pending"
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                  >
                    {order.paymentStatus.charAt(0).toUpperCase() +
                      order.paymentStatus.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Order Status</span>
                  <span
                    className={`font-semibold ${
                      order.orderStatus === "confirmed" ||
                      order.orderStatus === "processing"
                        ? "text-blue-400"
                        : order.orderStatus === "shipped"
                        ? "text-purple-400"
                        : order.orderStatus === "delivered"
                        ? "text-green-400"
                        : "text-gray-400"
                    }`}
                  >
                    {order.orderStatus.charAt(0).toUpperCase() +
                      order.orderStatus.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-8 bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">What's Next?</h2>
          <div className="space-y-3 text-blue-300">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <p>
                You'll receive an email confirmation with your order details
                shortly.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              <p>
                Your alien collectibles will be carefully packaged and shipped
                within 1-2 business days.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p>Track your order status and view details in your profile.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          <Link
            to="/profile"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            View Order History
          </Link>
          <Link
            to="/aliens"
            className="inline-flex items-center justify-center gap-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white font-medium py-3 px-6 rounded-lg transition-all border border-gray-600"
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
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
