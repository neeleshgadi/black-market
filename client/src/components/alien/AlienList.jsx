import React from "react";
import AlienCard from "./AlienCard";
import LoadingSpinner from "../common/LoadingSpinner";
import ErrorMessage from "../common/ErrorMessage";

const AlienList = ({
  aliens,
  loading,
  error,
  pagination,
  onPageChange,
  onRetry,
}) => {
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

  // Pagination Controls
  const renderPaginationControls = () => {
    console.log("Pagination data:", pagination);
    console.log("Current page:", pagination?.currentPage);
    console.log("Total pages:", pagination?.totalPages);
    console.log(
      "Should show pagination?",
      pagination && pagination.totalPages > 1
    );

    if (!pagination || pagination.totalPages <= 1) {
      console.log(
        "Not showing pagination - totalPages:",
        pagination?.totalPages
      );
      return null;
    }

    const { currentPage, totalPages, hasNextPage, hasPrevPage } = pagination;

    // Generate page numbers to display
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if there are 5 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);

      // Calculate start and end of page range
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if we're near the beginning
      if (currentPage <= 3) {
        endPage = Math.min(totalPages - 1, 4);
      }

      // Adjust if we're near the end
      if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - 3);
      }

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pageNumbers.push("...");
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push("...");
      }

      // Always show last page
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }

    return (
      <div className="flex justify-center items-center space-x-2 mt-8 mb-4">
        {/* Previous Button */}
        <button
          onClick={() => hasPrevPage && onPageChange(currentPage - 1)}
          disabled={!hasPrevPage}
          className={`px-3 py-2 rounded-md ${
            hasPrevPage
              ? "bg-purple-600 hover:bg-purple-700 text-white"
              : "bg-gray-700 text-gray-400 cursor-not-allowed"
          }`}
          aria-label="Previous page"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Page Numbers */}
        {pageNumbers.map((page, index) => (
          <button
            key={index}
            onClick={() => {
              if (typeof page === "number" && page !== currentPage) {
                console.log("Calling onPageChange with:", page);
                onPageChange(page);
              }
            }}
            disabled={page === "..." || page === currentPage}
            className={`px-3 py-1 rounded-md ${
              page === currentPage
                ? "bg-purple-600 text-white"
                : page === "..."
                ? "bg-transparent text-gray-400 cursor-default"
                : "bg-gray-700 hover:bg-gray-600 text-white"
            }`}
          >
            {page}
          </button>
        ))}

        {/* Next Button */}
        <button
          onClick={() => hasNextPage && onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          className={`px-3 py-2 rounded-md ${
            hasNextPage
              ? "bg-purple-600 hover:bg-purple-700 text-white"
              : "bg-gray-700 text-gray-400 cursor-not-allowed"
          }`}
          aria-label="Next page"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    );
  };

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
          Found {pagination?.totalCount || aliens.length} alien
          {(pagination?.totalCount || aliens.length) !== 1 ? "s" : ""}
          {pagination?.totalCount > 0 && pagination?.currentPage > 1 && (
            <span className="ml-1">
              (Page {pagination.currentPage} of {pagination.totalPages})
            </span>
          )}
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

      {/* Pagination Controls */}
      {renderPaginationControls()}
    </div>
  );
};

export default AlienList;
