import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAlienById, getRelatedAliens } from "../services/alienService";
import { useCart } from "../context/CartContext";
import { getImageUrl } from "../utils/imageUtils";
import AlienCard from "../components/alien/AlienCard";
import WishlistButton from "../components/common/WishlistButton";

const AlienDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [alien, setAlien] = useState(null);
  const [relatedAliens, setRelatedAliens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchAlienData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch alien details and related aliens in parallel
        const [alienResponse, relatedResponse] = await Promise.all([
          getAlienById(id),
          getRelatedAliens(id, 4),
        ]);

        setAlien(alienResponse.data);
        setRelatedAliens(relatedResponse.data);
      } catch (err) {
        console.error("Error fetching alien data:", err);
        setError(err.message || "Failed to load alien details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAlienData();
    }
  }, [id]);

  const handleAddToCart = () => {
    if (alien && alien.inStock) {
      addToCart(alien, quantity);
      // Simple feedback - you could replace this with a toast notification
      alert(
        `Added ${quantity} ${alien.name}${quantity > 1 ? "s" : ""} to cart!`
      );
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity?.toLowerCase()) {
      case "common":
        return "text-gray-400 bg-gray-800";
      case "rare":
        return "text-blue-400 bg-blue-900";
      case "epic":
        return "text-purple-400 bg-purple-900";
      case "legendary":
        return "text-yellow-400 bg-yellow-900";
      default:
        return "text-gray-400 bg-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col justify-center items-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-gray-400">Loading alien details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-400 mb-4">Error</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate("/aliens")}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded transition-colors duration-200"
          >
            Back to Aliens
          </button>
        </div>
      </div>
    );
  }

  if (!alien) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-400 mb-4">
            Alien Not Found
          </h1>
          <p className="text-gray-400 mb-6">
            The alien you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate("/aliens")}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded transition-colors duration-200"
          >
            Back to Aliens
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate("/aliens")}
        className="mb-6 flex items-center text-purple-400 hover:text-purple-300 transition-colors duration-200"
      >
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
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Aliens
      </button>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Image Section */}
        <div className="space-y-4">
          <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-square">
            {alien.image ? (
              <img
                src={getImageUrl(alien.image)}
                alt={alien.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : null}

            {/* Fallback placeholder */}
            <div
              className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900 to-gray-900 ${
                alien.image ? "hidden" : "flex"
              }`}
              style={{ display: alien.image ? "none" : "flex" }}
            >
              <div className="text-center">
                <svg
                  className="w-24 h-24 mx-auto mb-4 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <p className="text-purple-300 text-xl font-medium">
                  {alien.name}
                </p>
              </div>
            </div>

            {/* Rarity Badge */}
            <div
              className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold ${getRarityColor(
                alien.rarity
              )}`}
            >
              {alien.rarity}
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-6">
          {/* Name and Basic Info */}
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{alien.name}</h1>
            <div className="flex flex-wrap gap-4 text-lg">
              <span className="text-gray-300">
                <span className="text-purple-400">Faction:</span>{" "}
                {alien.faction}
              </span>
              <span className="text-gray-300">
                <span className="text-purple-400">Planet:</span> {alien.planet}
              </span>
            </div>
          </div>

          {/* Price and Stock */}
          <div className="border-t border-gray-700 pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl font-bold text-green-400">
                ${alien.price?.toFixed(2)}
              </span>
              <span
                className={`text-sm font-medium ${
                  alien.inStock ? "text-green-400" : "text-red-400"
                }`}
              >
                {alien.inStock ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            {/* Quantity and Add to Cart */}
            {alien.inStock && (
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center space-x-2">
                  <label htmlFor="quantity" className="text-gray-300">
                    Quantity:
                  </label>
                  <select
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white focus:outline-none focus:border-purple-500"
                  >
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded transition-colors duration-200"
                >
                  Add to Cart
                </button>
                <WishlistButton alienId={alien._id} size="large" />
              </div>
            )}

            {/* Wishlist button for out of stock items */}
            {!alien.inStock && (
              <div className="flex items-center justify-between mb-6">
                <span className="text-red-400 font-semibold">Out of Stock</span>
                <WishlistButton alienId={alien._id} size="large" />
              </div>
            )}
          </div>

          {/* Backstory */}
          {alien.backstory && (
            <div className="border-t border-gray-700 pt-6">
              <h2 className="text-2xl font-bold text-white mb-3">Backstory</h2>
              <p className="text-gray-300 leading-relaxed">{alien.backstory}</p>
            </div>
          )}

          {/* Abilities */}
          {alien.abilities && alien.abilities.length > 0 && (
            <div className="border-t border-gray-700 pt-6">
              <h2 className="text-2xl font-bold text-white mb-3">Abilities</h2>
              <ul className="space-y-2">
                {alien.abilities.map((ability, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-purple-400 mr-2">•</span>
                    <span className="text-gray-300">{ability}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Clothing Style */}
          {alien.clothingStyle && (
            <div className="border-t border-gray-700 pt-6">
              <h2 className="text-2xl font-bold text-white mb-3">
                Clothing Style
              </h2>
              <p className="text-gray-300">{alien.clothingStyle}</p>
            </div>
          )}
        </div>
      </div>

      {/* Related Aliens Section */}
      {relatedAliens && relatedAliens.length > 0 && (
        <div className="border-t border-gray-700 pt-8">
          <h2 className="text-3xl font-bold text-white mb-6">Related Aliens</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedAliens.map((relatedAlien) => (
              <AlienCard key={relatedAlien._id} alien={relatedAlien} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlienDetailPage;
