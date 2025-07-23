import { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";

const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    responseTime: 0,
    memoryUsage: {},
    uptime: 0,
    requestCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await adminService.getSystemMetrics();
        setMetrics(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch performance metrics");
        console.error("Performance metrics error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();

    // Refresh metrics every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);

    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const getMemoryUsagePercentage = () => {
    if (!metrics.memoryUsage.heapUsed || !metrics.memoryUsage.heapTotal)
      return 0;
    return Math.round(
      (metrics.memoryUsage.heapUsed / metrics.memoryUsage.heapTotal) * 100
    );
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Performance Monitor
        </h3>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Performance Monitor
        </h3>
        <div className="text-red-400 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        Performance Monitor
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Response Time */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Avg Response Time</div>
          <div className="text-2xl font-bold text-white">
            {metrics.responseTime}ms
          </div>
          <div
            className={`text-xs ${
              metrics.responseTime > 1000 ? "text-red-400" : "text-green-400"
            }`}
          >
            {metrics.responseTime > 1000 ? "Slow" : "Good"}
          </div>
        </div>

        {/* Memory Usage */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Memory Usage</div>
          <div className="text-2xl font-bold text-white">
            {getMemoryUsagePercentage()}%
          </div>
          <div className="text-xs text-gray-400">
            {metrics.memoryUsage.heapUsed}MB / {metrics.memoryUsage.heapTotal}MB
          </div>
        </div>

        {/* Uptime */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Uptime</div>
          <div className="text-lg font-bold text-white">
            {formatUptime(metrics.uptime)}
          </div>
          <div className="text-xs text-green-400">Running</div>
        </div>

        {/* Request Count */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Total Requests</div>
          <div className="text-2xl font-bold text-white">
            {metrics.requestCount.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400">Since startup</div>
        </div>
      </div>

      {/* Memory Usage Chart */}
      <div className="mt-6">
        <div className="text-sm text-gray-400 mb-2">Memory Usage Breakdown</div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300">Heap Used</span>
            <span className="text-sm text-white">
              {metrics.memoryUsage.heapUsed}MB
            </span>
          </div>
          <div className="w-full bg-gray-600 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${getMemoryUsagePercentage()}%` }}
            ></div>
          </div>

          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>RSS: {metrics.memoryUsage.rss}MB</span>
            <span>External: {metrics.memoryUsage.external}MB</span>
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default PerformanceMonitor;
