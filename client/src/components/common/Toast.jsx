import React, { useState, useEffect } from "react";

const Toast = ({
  message,
  type = "info",
  duration = 3000,
  onClose,
  position = "top-right",
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const typeStyles = {
    success: {
      bg: "bg-green-900/90 border-green-500/50",
      icon: "✅",
      iconColor: "text-green-400",
    },
    error: {
      bg: "bg-red-900/90 border-red-500/50",
      icon: "❌",
      iconColor: "text-red-400",
    },
    warning: {
      bg: "bg-yellow-900/90 border-yellow-500/50",
      icon: "⚠️",
      iconColor: "text-yellow-400",
    },
    info: {
      bg: "bg-blue-900/90 border-blue-500/50",
      icon: "ℹ️",
      iconColor: "text-blue-400",
    },
  };

  const positionStyles = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-center": "top-4 left-1/2 transform -translate-x-1/2",
    "bottom-center": "bottom-4 left-1/2 transform -translate-x-1/2",
  };

  const styles = typeStyles[type] || typeStyles.info;

  return (
    <div
      className={`
        fixed z-50 ${positionStyles[position]}
        ${styles.bg} backdrop-blur-sm border rounded-lg shadow-lg
        px-4 py-3 max-w-sm w-full mx-4 sm:mx-0
        transition-all duration-300 ease-in-out
        ${
          isExiting
            ? "opacity-0 transform translate-y-2"
            : "opacity-100 transform translate-y-0"
        }
      `}
    >
      <div className="flex items-center space-x-3">
        <span className="text-lg flex-shrink-0">{styles.icon}</span>
        <p className="text-white text-sm flex-1">{message}</p>
        <button
          onClick={() => {
            setIsExiting(true);
            setTimeout(() => {
              setIsVisible(false);
              onClose?.();
            }, 300);
          }}
          className="text-gray-400 hover:text-white transition-colors flex-shrink-0 focus-visible"
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
      </div>
    </div>
  );
};

// Toast Container Component
export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          position={toast.position}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
};

export default Toast;
