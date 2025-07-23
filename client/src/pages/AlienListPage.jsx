import React, { useState, useEffect, useCallback } from "react";
import { getAliens, getFilterOptions } from "../services/alienService";
import SearchBar from "../components/alien/SearchBar";
import AlienFilters from "../components/alien/AlienFilters";
import AlienList from "../components/alien/AlienList";
import { useSearchParams } from "react-router-dom";

const AlienListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [aliens, setAliens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
  const [filterOptions, setFilterOptions] = useState({});
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 12,
  });

  // Get parameters from URL
  const currentPage = parseInt(searchParams.get("page") || "1");

  // Log when page changes
  useEffect(() => {
    console.log("Page changed to:", currentPage);
  }, [currentPage]);

  // Initialize search term and filters from URL parameters
  useEffect(() => {
    const urlSearchTerm = searchParams.get("search");
    if (urlSearchTerm && urlSearchTerm !== searchTerm) {
      setSearchTerm(urlSearchTerm);
    }

    // Initialize filters from URL parameters
    const urlFilters = {};
    const filterKeys = [
      "faction",
      "planet",
      "rarity",
      "minPrice",
      "maxPrice",
      "featured",
      "inStock",
    ];

    filterKeys.forEach((key) => {
      const value = searchParams.get(key);
      if (value) {
        urlFilters[key] = value;
      }
    });

    if (Object.keys(urlFilters).length > 0) {
      setFilters(urlFilters);
    }
  }, [searchParams, searchTerm]);

  // Fetch filter options on component mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await getFilterOptions();
        setFilterOptions(response.data || response);
      } catch (err) {
        console.error("Error fetching filter options:", err);
        // Continue without filter options if this fails
      }
    };

    fetchFilterOptions();
  }, []);

  // Fetch aliens based on search, filters, and pagination
  const fetchAliens = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the current page from URL to ensure it's up-to-date
      const pageFromUrl = parseInt(searchParams.get("page") || "1");
      console.log("Page from URL in fetchAliens:", pageFromUrl);

      // Build query parameters
      const params = {
        page: pageFromUrl,
        limit: 12,
      };

      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      // Add filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "") {
          params[key] = value;
        }
      });

      console.log("Fetching aliens with params:", params);
      console.log("Current page being used:", currentPage);

      const response = await getAliens(params);

      console.log("API Response:", response);
      console.log("Pagination data:", response.data?.pagination);
      console.log(
        "Number of aliens returned:",
        response.data?.aliens?.length || 0
      );
      console.log("Aliens data:", response.data?.aliens);

      if (response.success && response.data) {
        setAliens(response.data.aliens || []);
        setPagination(
          response.data.pagination || {
            currentPage: currentPage,
            totalPages: 1,
            totalCount: response.data.aliens?.length || 0,
            hasNextPage: false,
            hasPrevPage: false,
            limit: 12,
          }
        );
      } else {
        // Fallback for older API response format
        setAliens(response.aliens || response || []);
        setPagination({
          currentPage: currentPage,
          totalPages: 1,
          totalCount: (response.aliens || response || []).length,
          hasNextPage: false,
          hasPrevPage: false,
          limit: 12,
        });
      }
    } catch (err) {
      console.error("Error fetching aliens:", err);
      setError(err);
      setAliens([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filters, searchParams]);

  // Fetch aliens when dependencies change
  useEffect(() => {
    fetchAliens();
  }, [fetchAliens, searchParams]);

  const handleSearchChange = (term) => {
    setSearchTerm(term);

    // Create a new URLSearchParams object with current params
    const newParams = new URLSearchParams(searchParams);

    // Reset to page 1 when search changes
    newParams.set("page", "1");

    // Update search parameter
    if (term.trim()) {
      newParams.set("search", term.trim());
    } else {
      newParams.delete("search");
    }

    // Set the updated search params
    setSearchParams(newParams);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);

    // Create a new URLSearchParams object with current params
    const newParams = new URLSearchParams(searchParams);

    // Reset to page 1 when filters change
    newParams.set("page", "1");

    // Update filter parameters
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== "") {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });

    // Set the updated search params
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    console.log("🔄 handlePageChange called with:", newPage);
    console.log(
      "🔄 Current searchParams before change:",
      Object.fromEntries(searchParams.entries())
    );

    // Create a new URLSearchParams object with current params
    const newParams = new URLSearchParams(searchParams);

    // Update the page parameter
    newParams.set("page", newPage.toString());

    console.log(
      "🔄 New search params after change:",
      Object.fromEntries(newParams.entries())
    );

    // Set the updated search params
    setSearchParams(newParams);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Alien Collectibles
          </h1>
          <p className="text-gray-400 text-lg">
            Discover rare alien characters from across the galaxy
          </p>
        </div>

        {/* Search Bar */}
        <SearchBar onSearchChange={handleSearchChange} />

        {/* Filters */}
        <AlienFilters
          onFiltersChange={handleFiltersChange}
          filterOptions={filterOptions}
        />

        {/* Alien List with Pagination */}
        <AlienList
          aliens={aliens}
          loading={loading}
          error={error}
          pagination={pagination}
          onPageChange={handlePageChange}
          onRetry={fetchAliens}
        />
      </div>
    </div>
  );
};

export default AlienListPage;
