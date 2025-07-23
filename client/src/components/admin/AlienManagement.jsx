import React, { useState, useEffect } from "react";
import { getAllAliens, deleteAlien } from "../../services/adminService";
import { getImageUrl } from "../../utils/imageUtils";
import AlienForm from "./AlienForm";
import LoadingSpinner from "../common/LoadingSpinner";

const AlienManagement = () => {
  const [aliens, setAliens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAlien, setEditingAlien] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    faction: "",
    rarity: "",
    inStock: "",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  });

  useEffect(() => {
    fetchAliens();
  }, [searchTerm, filters, pagination.currentPage]);

  const fetchAliens = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.currentPage,
        limit: 12,
        search: searchTerm,
        ...filters,
      };

      const response = await getAllAliens(params);
      setAliens(response.data.aliens);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.error?.message || "Failed to load aliens");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (alienId) => {
    if (!window.confirm("Are you sure you want to delete this alien?")) {
      return;
    }

    try {
      await deleteAlien(alienId);
      fetchAliens(); // Refresh the list
    } catch (err) {
      alert(err.error?.message || "Failed to delete alien");
    }
  };

  const handleEdit = (alien) => {
    setEditingAlien(alien);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingAlien(null);
    fetchAliens(); // Refresh the list
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  if (showForm) {
    return (
      <AlienForm
        alien={editingAlien}
        onClose={handleFormClose}
        onSuccess={handleFormClose}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Alien Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          Add New Alien
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search aliens..."
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">
              Faction
            </label>
            <select
              value={filters.faction}
              onChange={(e) => handleFilterChange("faction", e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Factions</option>
              <option value="Galactic Empire">Galactic Empire</option>
              <option value="Rebel Alliance">Rebel Alliance</option>
              <option value="Zephyrian Collective">Zephyrian Collective</option>
              <option value="Void Hunters">Void Hunters</option>
              <option value="Crystal Syndicate">Crystal Syndicate</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">
              Rarity
            </label>
            <select
              value={filters.rarity}
              onChange={(e) => handleFilterChange("rarity", e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Rarities</option>
              <option value="Common">Common</option>
              <option value="Rare">Rare</option>
              <option value="Epic">Epic</option>
              <option value="Legendary">Legendary</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">
              Stock Status
            </label>
            <select
              value={filters.inStock}
              onChange={(e) => handleFilterChange("inStock", e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All</option>
              <option value="true">In Stock</option>
              <option value="false">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <p className="text-red-400">Error: {error}</p>
          <button
            onClick={fetchAliens}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      )}

      {/* Aliens Grid */}
      {!loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {aliens.map((alien) => (
              <div
                key={alien._id}
                className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden"
              >
                <div className="aspect-w-1 aspect-h-1">
                  <img
                    src={getImageUrl(alien.image)}
                    alt={alien.name}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-white font-bold text-lg truncate">
                      {alien.name}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        alien.rarity === "Legendary"
                          ? "bg-yellow-900/50 text-yellow-400"
                          : alien.rarity === "Epic"
                          ? "bg-purple-900/50 text-purple-400"
                          : alien.rarity === "Rare"
                          ? "bg-blue-900/50 text-blue-400"
                          : "bg-gray-900/50 text-gray-400"
                      }`}
                    >
                      {alien.rarity}
                    </span>
                  </div>

                  <p className="text-gray-400 text-sm mb-1">{alien.faction}</p>
                  <p className="text-gray-400 text-sm mb-2">{alien.planet}</p>

                  <div className="flex justify-between items-center mb-3">
                    <span className="text-green-400 font-bold text-lg">
                      ${alien.price}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        alien.inStock
                          ? "bg-green-900/50 text-green-400"
                          : "bg-red-900/50 text-red-400"
                      }`}
                    >
                      {alien.inStock ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(alien)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(alien._id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="px-3 py-2 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
              >
                Previous
              </button>

              <span className="text-gray-400">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>

              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="px-3 py-2 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
              >
                Next
              </button>
            </div>
          )}

          {/* No Results */}
          {aliens.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No aliens found</p>
              <p className="text-gray-500 text-sm mt-2">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AlienManagement;
