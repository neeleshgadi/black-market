import React, { useState, useEffect } from "react";
import { getOrderById, getOrderTracking } from "../../services/orderService.js";
import { getImageUrl } from "../../utils/imageUtils";
import LoadingSpinner from "../common/LoadingSpinner.jsx";

const OrderDetails = ({ orderId, onClose }) => {
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError("");

    try {
      const [orderResult, trackingResult] = await Promise.all([
        getOrderById(orderId),
        getOrderTracking(orderId),
      ]);

      if (orderResult.success) {
        setOrder(orderResult.data);
      } else {
        setError(orderResult.error);
      }

      if (trackingResult.success) {
        setTracking(trackingResult.data);
      }
    } catch (err) {
      setError("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg">
        <p className="font-medium">Error loading order details</p>
        <p className="text-sm mt-1">{error}</p>
        <button
          onClick={fetchOrderDetails}
          className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-8 text-gray-400">
        Order details not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1">
        <button
          onClick={() => setActiveTab("details")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "details"
              ? "bg-purple-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          Order Details
        </button>
        <button
          onClick={() => setActiveTab("tracking")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "tracking"
              ? "bg-purple-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          Order Tracking
        </button>
      </div>

      {/* Order Details Tab */}
      {activeTab === "details" && (
        <div className="space-y-6">
          {/* Order Items */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">
              Order Items
            </h4>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg"
                >
                  <img
                    src={getImageUrl(item.alien.image)}
                    alt={item.alien.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h5 className="font-medium text-white">
                      {item.alien.name}
                    </h5>
                    <p className="text-sm text-gray-400">
                      {item.alien.faction} • {item.alien.rarity}
                    </p>
                    <p className="text-sm text-gray-400">
                      Planet: {item.alien.planet}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">
                      ${item.price.toFixed(2)} × {item.quantity}
                    </p>
                    <p className="text-sm text-gray-400">
                      Total: ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-4">
              Order Summary
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal:</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <div className="border-t border-gray-600 pt-2 mt-2">
                <div className="flex justify-between text-white font-semibold text-lg">
                  <span>Total:</span>
                  <span>${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-4">
              Shipping Address
            </h4>
            <div className="text-gray-300">
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.zipCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>

          {/* Order Notes */}
          {order.notes && (
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-white mb-4">
                Order Notes
              </h4>
              <p className="text-gray-300">{order.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Order Tracking Tab */}
      {activeTab === "tracking" && (
        <div className="space-y-6">
          {tracking ? (
            <>
              {/* Current Status */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-4">
                  Current Status
                </h4>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <p className="text-white font-medium">
                      {tracking.currentStatus.charAt(0).toUpperCase() +
                        tracking.currentStatus.slice(1)}
                    </p>
                    <p className="text-sm text-gray-400">
                      Payment:{" "}
                      {tracking.paymentStatus.charAt(0).toUpperCase() +
                        tracking.paymentStatus.slice(1)}
                    </p>
                  </div>
                  {tracking.estimatedDelivery && (
                    <div className="text-right">
                      <p className="text-sm text-gray-400">
                        Estimated Delivery
                      </p>
                      <p className="text-white font-medium">
                        {formatDate(tracking.estimatedDelivery)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tracking Timeline */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-4">
                  Order Timeline
                </h4>
                <div className="space-y-4">
                  {tracking.timeline.map((event, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex-shrink-0 mt-1">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            event.completed ? "bg-green-500" : "bg-gray-500"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p
                              className={`font-medium ${
                                event.completed ? "text-white" : "text-gray-400"
                              }`}
                            >
                              {event.title}
                            </p>
                            <p
                              className={`text-sm ${
                                event.completed
                                  ? "text-gray-300"
                                  : "text-gray-500"
                              }`}
                            >
                              {event.description}
                            </p>
                          </div>
                          {event.completed && (
                            <p className="text-xs text-gray-400">
                              {formatDate(event.timestamp)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-400">
              Tracking information not available
            </div>
          )}
        </div>
      )}

      {/* Close Button */}
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default OrderDetails;
