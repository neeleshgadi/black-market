import React, { useState, useEffect } from "react";
import { ALIEN_RARITIES } from "../../utils/constants";

const AlienFilters = ({ onFiltersChange, filterOptions = {} }) => {
  const [filters, setFilters] = useState({
    faction: "",
    planet: "",
    rarity: "",
    minPrice: "",
    maxPrice: "",
  });

  const [isExpanded, setIsExpanded] = useState(false);

  // Extract unique values from filterOptions
  const { factions = [], planets = [] } = filterOptions;

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      faction: "",
      planet: "",
      rarity: "",
      minPrice: "",
      maxPrice: "",
    });
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== "");

  return (
    <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 mb-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          Filters
        </h3>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              Clear All
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-white transition-colors md:hidden"
          >
            {isExpanded ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 ${
          !isExpanded ? "hidden md:grid" : ""
        }`}
      >
        {/* Faction Filter */}
        <div>
          <label
            htmlFor="faction-filter"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Faction
          </label>
          <select
            id="faction-filter"
            value={filters.faction}
            onChange={(e) => handleFilterChange("faction", e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Factions</option>
            {factions.map((faction) => (
              <option key={faction} value={faction}>
                {faction}
              </option>
            ))}
          </select>
        </div>

        {/* Planet Filter */}
        <div>
          <label
            htmlFor="planet-filter"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Planet
          </label>
          <select
            id="planet-filter"
            value={filters.planet}
            onChange={(e) => handleFilterChange("planet", e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Planets</option>
            {planets.map((planet) => (
              <option key={planet} value={planet}>
                {planet}
              </option>
            ))}
          </select>
        </div>

        {/* Rarity Filter */}
        <div>
          <label
            htmlFor="rarity-filter"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Rarity
          </label>
          <select
            id="rarity-filter"
            value={filters.rarity}
            onChange={(e) => handleFilterChange("rarity", e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Rarities</option>
            {ALIEN_RARITIES.map((rarity) => (
              <option key={rarity} value={rarity}>
                {rarity}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label
            htmlFor="min-price-filter"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Min Price
          </label>
          <input
            id="min-price-filter"
            type="number"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange("minPrice", e.target.value)}
            placeholder="$0"
            min="0"
            step="0.01"
            className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label
            htmlFor="max-price-filter"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Max Price
          </label>
          <input
            id="max-price-filter"
            type="number"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
            placeholder="$999"
            min="0"
            step="0.01"
            className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => {
              if (!value) return null;

              const displayValue = key.includes("Price") ? `$${value}` : value;

              const displayKey =
                key === "minPrice"
                  ? "Min"
                  : key === "maxPrice"
                  ? "Max"
                  : key.charAt(0).toUpperCase() + key.slice(1);

              return (
                <span
                  key={key}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-600 text-white"
                >
                  {displayKey}: {displayValue}
                  <button
                    onClick={() => handleFilterChange(key, "")}
                    className="ml-2 hover:text-gray-300"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlienFilters;
