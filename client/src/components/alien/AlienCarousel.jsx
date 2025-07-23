import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getFeaturedAliens } from "../../services/alienService";
import { getImageUrl } from "../../utils/imageUtils";

const AlienCarousel = () => {
  const [featuredAliens, setFeaturedAliens] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedAliens = async () => {
      try {
        setLoading(true);
        const response = await getFeaturedAliens(6);
        setFeaturedAliens(response.data || []);
      } catch (err) {
        console.error("Error fetching featured aliens:", err);
        setError("Failed to load featured aliens");
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedAliens();
  }, []);

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    if (featuredAliens.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex === featuredAliens.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [featuredAliens.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex(
      currentIndex === 0 ? featuredAliens.length - 1 : currentIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex(
      currentIndex === featuredAliens.length - 1 ? 0 : currentIndex + 1
    );
  };

  if (loading) {
    return (
      <div className="w-full h-96 bg-gray-800 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading featured aliens...</p>
        </div>
      </div>
    );
  }

  if (error || featuredAliens.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-800 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">
            {error || "No featured aliens available"}
          </p>
          <Link to="/aliens" className="btn-primary">
            Browse All Aliens
          </Link>
        </div>
      </div>
    );
  }

  const currentAlien = featuredAliens[currentIndex];

  return (
    // Added 'group' class here
    <div className="relative w-full h-96 bg-gray-800 rounded-lg overflow-hidden sci-fi-border group">
      {/* Main carousel content */}
      <div className="relative h-full">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20 z-10"></div>

        {/* Background gradient (fallback if no image) */}
        {(!currentAlien.image ||
          currentAlien.image.includes("example.com")) && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800"></div>
        )}

        {/* Alien image */}
        {currentAlien.image && !currentAlien.image.includes("example.com") && (
          <div className="absolute top-0 left-0 h-full w-full overflow-hidden">
            {/* Use a div with background image for better quality */}
            <div
              className="h-full w-full carousel-image sharp-image"
              style={{
                backgroundImage: `url(${getImageUrl(currentAlien.image)})`,
                backgroundSize: "cover",
                backgroundPosition: "center 20%",
                backgroundRepeat: "no-repeat",
                transform: "translateZ(0)",
                backfaceVisibility: "hidden",
              }}
            ></div>

            {/* Hidden img for preloading */}
            <img
              src={getImageUrl(currentAlien.image)}
              alt=""
              className="hidden"
              aria-hidden="true"
            />
          </div>
        )}

        {/* Content overlay */}
        <div className="relative z-20 h-full flex items-center">
          <div className="container mx-auto px-6">
            <div className="max-w-md">
              <div className="mb-2">
                <span className="inline-block px-3 py-1 bg-purple-600/80 text-white text-sm rounded-full">
                  Featured
                </span>
                <span
                  className={`inline-block px-3 py-1 ml-2 text-sm rounded-full ${
                    currentAlien.rarity === "Legendary"
                      ? "bg-yellow-600/80 text-white"
                      : currentAlien.rarity === "Epic"
                      ? "bg-purple-600/80 text-white"
                      : currentAlien.rarity === "Rare"
                      ? "bg-blue-600/80 text-white"
                      : "bg-gray-600/80 text-white"
                  }`}
                >
                  {currentAlien.rarity}
                </span>
              </div>

              <h3 className="text-4xl font-bold text-white mb-2 glow-text">
                {currentAlien.name}
              </h3>

              <p className="text-gray-300 mb-2">
                <span className="text-alien-green">{currentAlien.faction}</span>{" "}
                from{" "}
                <span className="text-purple-400">{currentAlien.planet}</span>
              </p>

              <p className="text-2xl font-bold text-white mb-4">
                ${currentAlien.price?.toFixed(2)}
              </p>

              {currentAlien.backstory && (
                <p className="text-gray-300 mb-6 line-clamp-3">
                  {currentAlien.backstory}
                </p>
              )}

              <div className="flex space-x-4">
                <Link
                  to={`/aliens/${currentAlien._id}`}
                  className="btn-primary"
                >
                  View Details
                </Link>
                <button className="btn-secondary">Add to Cart</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      {featuredAliens.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            // Added opacity-0, group-hover:opacity-100, and duration-300
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
          >
            <svg
              className="w-6 h-6"
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

          <button
            onClick={goToNext}
            // Added opacity-0, group-hover:opacity-100, and duration-300
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
          >
            <svg
              className="w-6 h-6"
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
        </>
      )}

      {/* Dots indicator */}
      {featuredAliens.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
          {featuredAliens.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-purple-400 scale-125"
                  : "bg-white/50 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AlienCarousel;
