import React, { useState } from "react";
import { cancelOrder } from "../../services/orderService.js";
import { getImageUrl } from "../../utils/imageUtils";
import OrderDetails from "./OrderDetails.jsx";

const OrderCard = ({ order, onOrderUpdate }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "processing":
        return "bg-yellow-900/50 text-yellow-200 border-yellow-500";
      case "confirmed":
        return "bg-blue-900/50 text-blue-200 border-blue-500";
      case "shipped":
        return "bg-purple-900/50 text-purple-200 border-purple-500";
      case "delivered":
        return "bg-green-900/50 text-green-200 border-green-500";
      case "cancelled":
        return "bg-red-900/50 text-red-200 border-red-500";
      default:
        return "bg-gray-900/50 text-gray-200 border-gray-500";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "text-green-400";
      case "pending":
        return "text-yellow-400";
      case "failed":
        return "text-red-400";
      case "refunded":
        return "text-blue-400";
      default:
        return "text-gray-400";
    }
  };

  const canCancelOrder = () => {
    return (
      (order.orderStatus === "processing" ||
        order.orderStatus === "confirmed") &&
      order.orderStatus !== "cancelled"
    );
  };

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    setCancelling(true);
    setMessage({ type: "", text: "" });

    try {
      const result = await cancelOrder(order.id);

      if (result.success) {
        setMessage({ type: "success", text: "Order cancelled successfully" });
        onOrderUpdate(); // Refresh the orders list
      } else {
        setMessage({ type: "error", text: result.error });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to cancel order" });
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      {/* Order Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">
            Order #{order.orderNumber}
          </h3>
          <p className="text-sm text-gray-400">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-white mb-1">
            ${order.totalAmount.toFixed(2)}
          </div>
          <div className="flex space-x-2">
            <span
              className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(
                order.orderStatus
              )}`}
            >
              {order.orderStatus.charAt(0).toUpperCase() +
                order.orderStatus.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Status */}
      <div className="mb-4">
        <span className="text-sm text-gray-400">Payment: </span>
        <span
          className={`text-sm font-medium ${getPaymentStatusColor(
            order.paymentStatus
          )}`}
        >
          {order.paymentStatus.charAt(0).toUpperCase() +
            order.paymentStatus.slice(1)}
        </span>
      </div>

      {/* Order Items Preview */}
      <div className="mb-4">
        <div className="flex items-center space-x-4">
          {order.items.slice(0, 3).map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <img
                src={getImageUrl(item.alien.image)}
                alt={item.alien.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <p className="text-sm font-medium text-white">
                  {item.alien.name}
                </p>
                <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
              </div>
            </div>
          ))}
          {order.items.length > 3 && (
            <div className="text-sm text-gray-400">
              +{order.items.length - 3} more item
              {order.items.length - 3 !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>

      {/* Message Display */}
      {message.text && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-900/50 border border-green-500 text-green-200"
              : "bg-red-900/50 border border-red-500 text-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
        >
          {showDetails ? "Hide Details" : "View Details"}
        </button>

        <div className="flex space-x-3">
          {canCancelOrder() && (
            <button
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelling ? "Cancelling..." : "Cancel Order"}
            </button>
          )}
          <button
            onClick={() => setShowDetails(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Track Order
          </button>
        </div>
      </div>

      {/* Order Details Modal/Expandable Section */}
      {showDetails && (
        <div className="mt-6 pt-6 border-t border-gray-700">
          <OrderDetails
            orderId={order.id}
            onClose={() => setShowDetails(false)}
          />
        </div>
      )}
    </div>
  );
};

export default OrderCard;
