import React from "react";

const LoadingSpinner = ({
  size = "large",
  text = "Loading...",
  variant = "default",
  className = "",
}) => {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const variants = {
    default: "border-gray-600 border-t-purple-500",
    alien: "border-gray-600 border-t-green-400",
    cosmic: "border-gray-600 border-t-blue-400",
    neon: "border-gray-600 border-t-purple-500 neon-glow",
  };

  const SciFiSpinner = () => (
    <div className="relative">
      {/* Outer ring */}
      <div
        className={`${sizeClasses[size]} border-2 ${variants[variant]} rounded-full animate-spin`}
      ></div>
      {/* Inner ring - counter rotation */}
      <div
        className={`absolute inset-2 border-2 border-gray-700 border-b-purple-400 rounded-full animate-spin`}
        style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
      ></div>
      {/* Center dot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
      </div>
    </div>
  );

  const PulseSpinner = () => (
    <div className="relative">
      <div className={`${sizeClasses[size]} relative`}>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`absolute inset-0 border-2 border-purple-500 rounded-full animate-ping`}
            style={{
              animationDelay: `${i * 0.5}s`,
              animationDuration: "2s",
            }}
          ></div>
        ))}
        <div
          className={`${sizeClasses[size]} border-2 border-purple-500 rounded-full`}
        ></div>
      </div>
    </div>
  );

  return (
    <div
      className={`flex flex-col items-center justify-center py-8 sm:py-12 ${className}`}
      role="status"
      aria-label={text}
    >
      <div className="mb-4">
        {variant === "pulse" ? <PulseSpinner /> : <SciFiSpinner />}
      </div>

      {text && (
        <div className="text-center fade-in">
          <p className="text-gray-400 text-sm sm:text-base">{text}</p>
          <div className="flex justify-center mt-2 space-x-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-1 h-1 bg-purple-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              ></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;
