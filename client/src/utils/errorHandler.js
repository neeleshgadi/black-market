// Error handling utilities for client-side

// Error types
export const ERROR_TYPES = {
  NETWORK: "NETWORK_ERROR",
  VALIDATION: "VALIDATION_ERROR",
  AUTH: "AUTH_ERROR",
  AUTHORIZATION: "AUTHORIZATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  SERVER: "SERVER_ERROR",
  RATE_LIMIT: "RATE_LIMIT_ERROR",
  UNKNOWN: "UNKNOWN_ERROR",
};

// User-friendly error messages
export const ERROR_MESSAGES = {
  [ERROR_TYPES.NETWORK]:
    "Unable to connect to the server. Please check your internet connection and try again.",
  [ERROR_TYPES.VALIDATION]: "Please check your input and try again.",
  [ERROR_TYPES.AUTH]:
    "Authentication failed. Please check your credentials and try again.",
  [ERROR_TYPES.AUTHORIZATION]:
    "You don't have permission to perform this action.",
  [ERROR_TYPES.NOT_FOUND]: "The requested resource was not found.",
  [ERROR_TYPES.SERVER]:
    "Something went wrong on our end. Please try again later.",
  [ERROR_TYPES.RATE_LIMIT]:
    "Too many requests. Please wait a moment before trying again.",
  [ERROR_TYPES.UNKNOWN]: "An unexpected error occurred. Please try again.",
};

// Parse error from API response
export const parseApiError = (error) => {
  // Network error (no response)
  if (!error.response) {
    return {
      type: ERROR_TYPES.NETWORK,
      message: ERROR_MESSAGES[ERROR_TYPES.NETWORK],
      details: null,
      statusCode: null,
    };
  }

  const { status, data } = error.response;
  const errorData = data?.error || {};

  // Determine error type based on status code and error code
  let type = ERROR_TYPES.UNKNOWN;
  if (status === 400) {
    type =
      errorData.code === "VALIDATION_ERROR"
        ? ERROR_TYPES.VALIDATION
        : ERROR_TYPES.UNKNOWN;
  } else if (status === 401) {
    type = ERROR_TYPES.AUTH;
  } else if (status === 403) {
    type = ERROR_TYPES.AUTHORIZATION;
  } else if (status === 404) {
    type = ERROR_TYPES.NOT_FOUND;
  } else if (status === 429) {
    type = ERROR_TYPES.RATE_LIMIT;
  } else if (status >= 500) {
    type = ERROR_TYPES.SERVER;
  }

  return {
    type,
    message: errorData.message || ERROR_MESSAGES[type],
    details: errorData.details || null,
    statusCode: status,
    code: errorData.code || null,
    retryAfter: errorData.retryAfter || null,
  };
};

// Format validation errors for display
export const formatValidationErrors = (errors) => {
  if (!Array.isArray(errors)) return {};

  return errors.reduce((acc, error) => {
    acc[error.field] = error.message;
    return acc;
  }, {});
};

// Get user-friendly error message
export const getUserFriendlyMessage = (error) => {
  const parsedError = parseApiError(error);

  // For validation errors, show specific field errors if available
  if (parsedError.type === ERROR_TYPES.VALIDATION && parsedError.details) {
    const fieldErrors = formatValidationErrors(parsedError.details);
    const firstError = Object.values(fieldErrors)[0];
    return firstError || parsedError.message;
  }

  return parsedError.message;
};

// Check if error is retryable
export const isRetryableError = (error) => {
  const parsedError = parseApiError(error);
  return [ERROR_TYPES.NETWORK, ERROR_TYPES.SERVER].includes(parsedError.type);
};

// Get retry delay for rate limited requests
export const getRetryDelay = (error) => {
  const parsedError = parseApiError(error);
  if (parsedError.type === ERROR_TYPES.RATE_LIMIT && parsedError.retryAfter) {
    return parsedError.retryAfter * 1000; // Convert to milliseconds
  }
  return null;
};

// Log error for debugging (in development)
export const logError = (error, context = {}) => {
  if (process.env.NODE_ENV === "development") {
    console.group("🚨 Error Details");
    console.error("Error:", error);
    console.log("Context:", context);
    console.log("Parsed:", parseApiError(error));
    console.groupEnd();
  }
};

// Error boundary helper
export const handleUnexpectedError = (error, errorInfo) => {
  console.error("Unexpected error caught by error boundary:", error, errorInfo);

  // In a real app, you might want to send this to an error reporting service
  // like Sentry, LogRocket, etc.
  if (process.env.NODE_ENV === "production") {
    // reportErrorToService(error, errorInfo);
  }
};

export default {
  ERROR_TYPES,
  ERROR_MESSAGES,
  parseApiError,
  formatValidationErrors,
  getUserFriendlyMessage,
  isRetryableError,
  getRetryDelay,
  logError,
  handleUnexpectedError,
};
