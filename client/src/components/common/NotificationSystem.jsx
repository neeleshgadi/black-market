import React, { createContext, useContext, useState, useCallback } from "react";
import {
  parseApiError,
  getUserFriendlyMessage,
} from "../../utils/errorHandler.js";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

// Notification types
const NOTIFICATION_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
  LOADING: "loading",
};

// Notification component
const Notification = ({ notification, onClose }) => {
  const { id, type, title, message, duration, actions, persistent } =
    notification;

  React.useEffect(() => {
    if (!persistent && duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, persistent, onClose]);

  const typeStyles = {
    success: {
      bg: "bg-green-900/90 border-green-500/50",
      icon: "✅",
      iconBg: "bg-green-500/20",
      iconColor: "text-green-400",
    },
    error: {
      bg: "bg-red-900/90 border-red-500/50",
      icon: "❌",
      iconBg: "bg-red-500/20",
      iconColor: "text-red-400",
    },
    warning: {
      bg: "bg-yellow-900/90 border-yellow-500/50",
      icon: "⚠️",
      iconBg: "bg-yellow-500/20",
      iconColor: "text-yellow-400",
    },
    info: {
      bg: "bg-blue-900/90 border-blue-500/50",
      icon: "ℹ️",
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-400",
    },
    loading: {
      bg: "bg-gray-900/90 border-gray-500/50",
      icon: "⏳",
      iconBg: "bg-gray-500/20",
      iconColor: "text-gray-400",
    },
  };

  const styles = typeStyles[type] || typeStyles.info;

  return (
    <div
      className={`
        ${styles.bg} backdrop-blur-sm border rounded-lg shadow-lg
        p-4 max-w-sm w-full mx-4 sm:mx-0 mb-4
        animate-in slide-in-from-right-full duration-300
      `}
    >
      <div className="flex items-start space-x-3">
        <div className={`${styles.iconBg} rounded-full p-2 flex-shrink-0`}>
          {type === "loading" ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
          ) : (
            <span className="text-sm">{styles.icon}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="text-white font-medium text-sm mb-1">{title}</h4>
          )}
          <p className="text-gray-300 text-sm">{message}</p>

          {actions && actions.length > 0 && (
            <div className="mt-3 flex space-x-2">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    action.onClick();
                    if (action.closeOnClick !== false) {
                      onClose(id);
                    }
                  }}
                  className={`
                    text-xs px-3 py-1 rounded font-medium transition-colors
                    ${
                      action.primary
                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                        : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                    }
                  `}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {!persistent && (
          <button
            onClick={() => onClose(id)}
            className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

// Notification container
const NotificationContainer = ({ notifications, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-50 max-h-screen overflow-y-auto">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          notification={notification}
          onClose={onClose}
        />
      ))}
    </div>
  );
};

// Notification provider
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      duration: 5000,
      persistent: false,
      ...notification,
    };

    setNotifications((prev) => [...prev, newNotification]);
    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods
  const showSuccess = useCallback(
    (message, options = {}) => {
      return addNotification({
        type: NOTIFICATION_TYPES.SUCCESS,
        message,
        ...options,
      });
    },
    [addNotification]
  );

  const showError = useCallback(
    (error, options = {}) => {
      let message = error;
      let title = "Error";

      // Handle API errors
      if (error && typeof error === "object") {
        if (error.response || error.parsedError) {
          message = getUserFriendlyMessage(error);
          const parsedError = error.parsedError || parseApiError(error);
          title =
            parsedError.type === "VALIDATION_ERROR"
              ? "Validation Error"
              : "Error";
        } else if (error.message) {
          message = error.message;
        }
      }

      return addNotification({
        type: NOTIFICATION_TYPES.ERROR,
        title,
        message,
        duration: 7000, // Longer duration for errors
        ...options,
      });
    },
    [addNotification]
  );

  const showWarning = useCallback(
    (message, options = {}) => {
      return addNotification({
        type: NOTIFICATION_TYPES.WARNING,
        message,
        ...options,
      });
    },
    [addNotification]
  );

  const showInfo = useCallback(
    (message, options = {}) => {
      return addNotification({
        type: NOTIFICATION_TYPES.INFO,
        message,
        ...options,
      });
    },
    [addNotification]
  );

  const showLoading = useCallback(
    (message, options = {}) => {
      return addNotification({
        type: NOTIFICATION_TYPES.LOADING,
        message,
        persistent: true, // Loading notifications don't auto-dismiss
        ...options,
      });
    },
    [addNotification]
  );

  // Handle API errors with retry functionality
  const handleApiError = useCallback(
    (error, retryFunction, options = {}) => {
      const actions = [];

      if (retryFunction) {
        actions.push({
          label: "Retry",
          primary: true,
          onClick: retryFunction,
        });
      }

      return showError(error, {
        actions,
        ...options,
      });
    },
    [showError]
  );

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    handleApiError,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer
        notifications={notifications}
        onClose={removeNotification}
      />
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
