import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import authService from "../services/authService";

const TestLoginPage = () => {
  const [email, setEmail] = useState("testuser@example.com");
  const [password, setPassword] = useState("TestPassword123");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [directResult, setDirectResult] = useState(null);

  const { login, isAuthenticated, user } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      console.log("Attempting login with context:", { email });
      const loginResult = await login(email, password);
      console.log("Login result from context:", loginResult);
      setResult({
        success: loginResult.success,
        message: loginResult.success ? "Login successful!" : loginResult.error,
      });
    } catch (error) {
      console.error("Login error from context:", error);
      setResult({
        success: false,
        message: error.message || "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDirectLogin = async () => {
    setLoading(true);
    setDirectResult(null);

    try {
      console.log("Attempting direct login with service:", { email });
      const response = await authService.login(email, password);
      console.log("Direct login response:", response);
      setDirectResult({
        success: response.success,
        message: response.success ? "Direct login successful!" : "Login failed",
        data: response.data,
      });

      // Set auth token
      if (response.success && response.data.token) {
        authService.setAuthToken(response.data.token);
      }
    } catch (error) {
      console.error("Direct login error:", error);
      setDirectResult({
        success: false,
        message:
          error.response?.data?.error?.message ||
          error.message ||
          "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Test Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            This is a test page to debug login issues
          </p>
        </div>

        {isAuthenticated && (
          <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded-lg">
            <p>You are already logged in as:</p>
            <pre className="mt-2 text-xs overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {result && (
            <div
              className={`px-4 py-3 rounded-lg ${
                result.success
                  ? "bg-green-900/50 border border-green-500 text-green-200"
                  : "bg-red-900/50 border border-red-500 text-red-200"
              }`}
            >
              {result.message}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-600 placeholder-gray-400 text-white bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-600 placeholder-gray-400 text-white bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 group relative flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                "Context Login"
              )}
            </button>

            <button
              type="button"
              onClick={handleDirectLogin}
              disabled={loading}
              className="flex-1 group relative flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                "Direct Login"
              )}
            </button>
          </div>

          {directResult && (
            <div
              className={`px-4 py-3 rounded-lg mt-4 ${
                directResult.success
                  ? "bg-blue-900/50 border border-blue-500 text-blue-200"
                  : "bg-red-900/50 border border-red-500 text-red-200"
              }`}
            >
              <p className="font-medium">{directResult.message}</p>
              {directResult.data && (
                <pre className="mt-2 text-xs overflow-auto">
                  {JSON.stringify(directResult.data, null, 2)}
                </pre>
              )}
            </div>
          )}

          <div className="mt-4">
            <h3 className="text-white font-medium mb-2">Debug Info:</h3>
            <div className="bg-gray-800 p-3 rounded-lg text-xs text-gray-300 font-mono overflow-auto">
              <p>isAuthenticated: {isAuthenticated ? "true" : "false"}</p>
              <p>user: {user ? JSON.stringify(user) : "null"}</p>
              <p>token: {localStorage.getItem("token") ? "exists" : "none"}</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TestLoginPage;
