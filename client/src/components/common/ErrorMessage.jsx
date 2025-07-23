import React from "react";

const ErrorMessage = ({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  type = "error",
  onRetry = null,
  className = "",
  showIcon = true,
}) => {
  const typeStyles = {
    error: {
      container: "border-red-500/20 bg-red-900/10",
      icon: "text-red-400",
      title: "text-red-300",
      message: "text-red-200",
      button: "bg-red-600 hover:bg-red-700",
    },
    warning: {
      container: "border-yellow-500/20 bg-yellow-900/10",
      icon: "text-yellow-400",
      title: "text-yellow-300",
      message: "text-yellow-200",
      button: "bg-yellow-600 hover:bg-yellow-700",
    },
    info: {
      container: "border-blue-500/20 bg-blue-900/10",
      icon: "text-blue-400",
      title: "text-blue-300",
      message: "text-blue-200",
      button: "bg-blue-600 hover:bg-blue-700",
    },
  };

  const styles = typeStyles[type] || typeStyles.error;

  const getIcon = () => {
    switch (type) {
      case "warning":
        return (
          <svg
            className="w-8 h-8 sm:w-12 sm:h-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        );
      case "info":
        return (
          <svg
            className="w-8 h-8 sm:w-12 sm:h-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-8 h-8 sm:w-12 sm:h-12"
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
        );
    }
  };

  return (
    <div
      className={`
      rounded-lg border p-6 sm:p-8 text-center max-w-md mx-auto
      ${styles.container} ${className}
      fade-in
    `}
    >
      {showIcon && (
        <div className={`${styles.icon} mb-4 flex justify-center`}>
          {getIcon()}
        </div>
      )}

      <h3 className={`text-lg sm:text-xl font-semibold mb-2 ${styles.title}`}>
        {title}
      </h3>

      <p
        className={`text-sm sm:text-base mb-6 ${styles.message} leading-relaxed`}
      >
        {message}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className={`
            px-4 py-2 rounded-lg font-medium transition-all duration-200
            ${styles.button} text-white
            hover:scale-105 focus-visible
          `}
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
