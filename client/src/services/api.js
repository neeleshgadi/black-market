import axios from "axios";
import { logError, parseApiError, ERROR_TYPES } from "../utils/errorHandler.js";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 15000, // Increased timeout
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for cookies/sessions
});

// Log the base URL for debugging
console.log(
  "API Base URL:",
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
);

// Request interceptor to add auth token and request ID
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add timestamp for request tracking
    config.metadata = { startTime: Date.now() };

    return config;
  },
  (error) => {
    logError(error, { phase: "request" });
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    // Log successful requests in development
    if (process.env.NODE_ENV === "development") {
      const duration = Date.now() - response.config.metadata.startTime;
      console.log(
        `✅ ${response.config.method?.toUpperCase()} ${
          response.config.url
        } - ${duration}ms`
      );
    }
    return response;
  },
  (error) => {
    const parsedError = parseApiError(error);

    // Log error with context
    logError(error, {
      url: error.config?.url,
      method: error.config?.method,
      phase: "response",
      parsedError,
    });

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      // Clear token and redirect to login if needed
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      delete api.defaults.headers.common["Authorization"];

      // Dispatch logout event for other parts of the app to listen to
      window.dispatchEvent(
        new CustomEvent("auth:logout", {
          detail: { reason: "token_expired" },
        })
      );
    }

    // Handle 403 errors (forbidden)
    if (error.response?.status === 403) {
      window.dispatchEvent(
        new CustomEvent("auth:forbidden", {
          detail: { url: error.config?.url },
        })
      );
    }

    // Handle network errors
    if (!error.response) {
      error.message =
        "Network error - please check your connection and try again";
    }

    // Enhance error object with parsed information
    error.parsedError = parsedError;

    return Promise.reject(error);
  }
);

// Helper function to handle API calls with consistent error handling
export const apiCall = async (apiFunction, errorContext = {}) => {
  try {
    const response = await apiFunction();
    return { success: true, data: response.data };
  } catch (error) {
    logError(error, { ...errorContext, function: apiFunction.name });
    return {
      success: false,
      error: error.parsedError || parseApiError(error),
      originalError: error,
    };
  }
};

// Retry helper for failed requests
export const retryApiCall = async (
  apiFunction,
  maxRetries = 3,
  delay = 1000
) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await apiCall(apiFunction, { attempt, maxRetries });
      if (result.success) {
        return result;
      }
      lastError = result.error;

      // Don't retry client errors (4xx) except for 429 (rate limit)
      if (
        result.error.statusCode >= 400 &&
        result.error.statusCode < 500 &&
        result.error.statusCode !== 429
      ) {
        break;
      }

      // Wait before retrying
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      }
    } catch (error) {
      lastError = parseApiError(error);
    }
  }

  return { success: false, error: lastError };
};

export default api;
