import React, { useState, useEffect } from "react";
import { getDashboardAnalytics } from "../../services/adminService";
import { getImageUrl } from "../../utils/imageUtils";
import LoadingSpinner from "../common/LoadingSpinner";

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDashboardAnalytics(timeRange);
      setAnalytics(response.data);
    } catch (err) {
      setError(err.error?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
        <p className="text-red-400">Error: {error}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const {
    overview,
    topSellingAliens,
    recentOrders,
    orderStatusDistribution,
    dailySales,
  } = analytics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(parseInt(e.target.value))}
          className="bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-600 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-gray-400 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-white">
                {overview.totalUsers}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-purple-600 rounded-lg">
              <span className="text-2xl">👽</span>
            </div>
            <div className="ml-4">
              <p className="text-gray-400 text-sm">Total Aliens</p>
              <p className="text-2xl font-bold text-white">
                {overview.totalAliens}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-600 rounded-lg">
              <span className="text-2xl">📦</span>
            </div>
            <div className="ml-4">
              <p className="text-gray-400 text-sm">Total Orders</p>
              <p className="text-2xl font-bold text-white">
                {overview.totalOrders}
              </p>
              <p className="text-green-400 text-sm">
                +{overview.recentOrders} recent
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-600 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-gray-400 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-white">
                ${overview.totalRevenue.toFixed(2)}
              </p>
              <p className="text-yellow-400 text-sm">
                Avg: ${overview.averageOrderValue.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Aliens */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">
            Top Selling Aliens
          </h2>
          <div className="space-y-4">
            {topSellingAliens.map((alien, index) => (
              <div key={alien._id} className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <img
                    src={getImageUrl(alien.image)}
                    alt={alien.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {alien.name}
                  </p>
                  <p className="text-gray-400 text-sm">{alien.faction}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">
                    {alien.totalSold} sold
                  </p>
                  <p className="text-green-400 text-sm">
                    ${alien.totalRevenue.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
            {topSellingAliens.length === 0 && (
              <p className="text-gray-400 text-center py-4">
                No sales data available
              </p>
            )}
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Order Status</h2>
          <div className="space-y-3">
            {orderStatusDistribution.map((status) => (
              <div
                key={status._id}
                className="flex justify-between items-center"
              >
                <span className="text-gray-300 capitalize">{status._id}</span>
                <span className="text-white font-medium">{status.count}</span>
              </div>
            ))}
            {orderStatusDistribution.length === 0 && (
              <p className="text-gray-400 text-center py-4">
                No order data available
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-gray-400 font-medium pb-3">Order #</th>
                <th className="text-gray-400 font-medium pb-3">Customer</th>
                <th className="text-gray-400 font-medium pb-3">Items</th>
                <th className="text-gray-400 font-medium pb-3">Total</th>
                <th className="text-gray-400 font-medium pb-3">Status</th>
                <th className="text-gray-400 font-medium pb-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-700/50">
                  <td className="py-3 text-white font-mono text-sm">
                    {order.orderNumber}
                  </td>
                  <td className="py-3">
                    <div>
                      <p className="text-white">{order.customer}</p>
                      <p className="text-gray-400 text-sm">{order.email}</p>
                    </div>
                  </td>
                  <td className="py-3 text-gray-300">{order.itemCount}</td>
                  <td className="py-3 text-white font-medium">
                    ${order.totalAmount.toFixed(2)}
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === "delivered"
                          ? "bg-green-900/50 text-green-400"
                          : order.status === "shipped"
                          ? "bg-blue-900/50 text-blue-400"
                          : order.status === "processing"
                          ? "bg-yellow-900/50 text-yellow-400"
                          : "bg-gray-900/50 text-gray-400"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 text-gray-400 text-sm">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentOrders.length === 0 && (
            <p className="text-gray-400 text-center py-8">No recent orders</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
