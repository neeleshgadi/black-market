import React, { useState, useEffect, useCallback } from "react";
import { getAliens, getFilterOptions } from "../services/alienService";
import SearchBar from "../components/alien/SearchBar";
import AlienFilters from "../components/alien/AlienFilters";
import AlienList from "../components/alien/AlienList";

const AlienListPage = () => {
  const [aliens, setAliens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
  const [filterOptions, setFilterOptions] = useState({});

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

  // Fetch aliens based on search and filters
  const fetchAliens = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = {};

      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      // Add filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "") {
          params[key] = value;
        }
      });

      const response = await getAliens(params);
      setAliens(response.data?.aliens || response.aliens || response || []);
    } catch (err) {
      console.error("Error fetching aliens:", err);
      setError(err);
      setAliens([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filters]);

  // Fetch aliens when search term or filters change
  useEffect(() => {
    fetchAliens();
  }, [fetchAliens]);

  const handleSearchChange = (term) => {
    setSearchTerm(term);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
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

        {/* Alien List */}
        <AlienList aliens={aliens} loading={loading} error={error} />
      </div>
    </div>
  );
};

export default AlienListPage;
