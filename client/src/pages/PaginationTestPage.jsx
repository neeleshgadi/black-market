import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getAliens } from "../services/alienService";

const PaginationTestPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [aliens, setAliens] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);

  const currentPage = parseInt(searchParams.get("page") || "1");

  const fetchAliens = async (page) => {
    setLoading(true);
    try {
      const response = await getAliens({ page, limit: 6 });
      console.log("Test page response:", response);

      if (response.success && response.data) {
        setAliens(response.data.aliens || []);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAliens(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    console.log("Changing to page:", newPage);
    setSearchParams({ page: newPage.toString() });
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Pagination Test</h1>

      <div className="mb-4">
        <p>Current Page from URL: {currentPage}</p>
        <p>Loading: {loading ? "Yes" : "No"}</p>
        <p>Aliens Count: {aliens.length}</p>
      </div>

      {pagination && (
        <div className="mb-4 p-4 bg-gray-800 rounded">
          <h3 className="font-bold mb-2">Pagination Info:</h3>
          <p>Current Page: {pagination.currentPage}</p>
          <p>Total Pages: {pagination.totalPages}</p>
          <p>Total Count: {pagination.totalCount}</p>
          <p>Has Next: {pagination.hasNextPage ? "Yes" : "No"}</p>
          <p>Has Prev: {pagination.hasPrevPage ? "Yes" : "No"}</p>
        </div>
      )}

      <div className="mb-4">
        <h3 className="font-bold mb-2">Test Buttons:</h3>
        <button
          onClick={() => handlePageChange(1)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mr-2"
        >
          Page 1
        </button>
        <button
          onClick={() => handlePageChange(2)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mr-2"
        >
          Page 2
        </button>
        <button
          onClick={() => handlePageChange(3)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mr-2"
        >
          Page 3
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {aliens.map((alien) => (
          <div key={alien._id} className="bg-gray-800 p-4 rounded">
            <h4 className="font-bold">{alien.name}</h4>
            <p className="text-sm text-gray-400">{alien.faction}</p>
            <p className="text-sm text-gray-400">{alien.planet}</p>
            <p className="text-green-400">${alien.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaginationTestPage;
