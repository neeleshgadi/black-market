import React from "react";
import AlienCard from "./AlienCard";
import LoadingSpinner from "../common/LoadingSpinner";
import ErrorMessage from "../common/ErrorMessage";

const AlienList = ({ aliens, loading, error, onRetry }) => {
  if (loading) {
    return (
      <LoadingSpinner
        size="large"
        text="Scanning the galaxy for aliens..."
        variant="alien"
        className="py-16"
      />
    );
  }

  if (error) {
    return (
      <div className="py-12">
        <ErrorMessage
          title="Error Loading Aliens"
          message={
            error.message ||
            "Something went wrong while scanning the galaxy. Please try again."
          }
          onRetry={onRetry}
          className="max-w-lg"
        />
      </div>
    );
  }

  if (!aliens || aliens.length === 0) {
    return (
      <div className="py-12">
        <ErrorMessage
          title="No Aliens Found"
          message="We couldn't find any aliens matching your search criteria. Try adjusting your filters or search terms to discover more alien collectibles."
          type="info"
          showIcon={true}
          className="max-w-lg"
        />
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Results Count */}
      <div className="mb-4 sm:mb-6 text-gray-400 text-sm sm:text-base">
        <span className="inline-flex items-center">
          <svg
            className="w-4 h-4 mr-2 text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Found {aliens.length} alien{aliens.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Alien Grid */}
      <div className="grid-responsive">
        {aliens.map((alien, index) => (
          <div
            key={alien._id}
            className="fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <AlienCard alien={alien} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlienList;
