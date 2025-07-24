import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AlienCarousel from "../components/alien/AlienCarousel";

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="container-responsive py-8 sm:py-12 md:py-16">
          {/* Main hero content */}
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-responsive-xl font-bold mb-4 sm:mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-green-400 to-blue-400 animate-pulse">
              BLACK MARKET
            </h1>
            <p className="text-responsive-md mb-3 sm:mb-4 text-gray-300 font-light">
              Galactic Alien Collectibles
            </p>
            <p className="text-base sm:text-lg text-gray-400 mb-6 sm:mb-8 max-w-2xl mx-auto px-4 text-balance">
              Discover rare alien character cards from across the universe. Each
              collectible tells a unique story from distant worlds and forgotten
              civilizations.
            </p>

            {/* CTA Button */}
            <Link
              to="/aliens"
              className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 text-white font-bold text-base sm:text-lg rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl neon-glow focus-visible"
            >
              <span className="mr-2">🚀</span>
              <span className="hidden sm:inline">Explore Galaxies</span>
              <span className="sm:hidden">Explore</span>
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>

          {/* Featured Aliens Carousel */}
          <div className="mb-12 sm:mb-16">
            <div className="text-center mb-6 sm:mb-8 px-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Featured Aliens
              </h2>
              <p className="text-gray-400 text-sm sm:text-base">
                Rare and legendary beings from across the cosmos
              </p>
            </div>
            <AlienCarousel />
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16 px-4">
            <div className="card-hover text-center group slide-in-left">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">👽</div>
              <h3 className="text-lg sm:text-xl font-bold text-purple-400 mb-2">
                Rare Collectibles
              </h3>
              <p className="text-gray-400 text-sm sm:text-base">
                Discover unique alien beings with rich backstories and
                extraordinary abilities from distant worlds.
              </p>
            </div>

            <div
              className="card-hover text-center group fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🌌</div>
              <h3 className="text-lg sm:text-xl font-bold text-green-400 mb-2">
                Galactic Origins
              </h3>
              <p className="text-gray-400 text-sm sm:text-base">
                Each alien comes from a different planet with detailed
                information about their faction and homeworld.
              </p>
            </div>

            <div className="card-hover text-center group slide-in-right">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">⚡</div>
              <h3 className="text-lg sm:text-xl font-bold text-blue-400 mb-2">
                Legendary Powers
              </h3>
              <p className="text-gray-400 text-sm sm:text-base">
                Learn about unique abilities, clothing styles, and the
                fascinating lore behind each character.
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16 px-4">
            <div
              className="text-center fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="text-2xl sm:text-3xl font-bold text-purple-400 mb-1 pulse-slow">
                500+
              </div>
              <div className="text-gray-400 text-xs sm:text-sm">
                Alien Species
              </div>
            </div>
            <div
              className="text-center fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="text-2xl sm:text-3xl font-bold text-green-400 mb-1 pulse-slow">
                50+
              </div>
              <div className="text-gray-400 text-xs sm:text-sm">Planets</div>
            </div>
            <div
              className="text-center fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="text-2xl sm:text-3xl font-bold text-blue-400 mb-1 pulse-slow">
                20+
              </div>
              <div className="text-gray-400 text-xs sm:text-sm">Factions</div>
            </div>
            <div
              className="text-center fade-in"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-1 pulse-slow">
                ∞
              </div>
              <div className="text-gray-400 text-xs sm:text-sm">Adventures</div>
            </div>
          </div>

          {/* Call to Action Section */}
          <div className="text-center px-4 relative z-10">
            <div className="card max-w-2xl mx-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
                Ready to Start Your Collection?
              </h2>
              <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base text-balance">
                Join thousands of collectors exploring the galaxy's most
                fascinating beings. Start your journey into the unknown today.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center relative z-20">
                <Link
                  to="/aliens"
                  className="btn-primary focus-visible inline-block text-center cursor-pointer"
                  style={{ pointerEvents: "auto" }}
                >
                  🔍 Browse Collection
                </Link>
                {!isAuthenticated && (
                  <Link
                    to="/register"
                    className="btn-secondary focus-visible inline-block text-center cursor-pointer"
                    style={{ pointerEvents: "auto" }}
                  >
                    🚀 Create Account
                  </Link>
                )}
                {isAuthenticated && (
                  <Link
                    to="/profile"
                    className="btn-secondary focus-visible inline-block text-center cursor-pointer"
                    style={{ pointerEvents: "auto" }}
                  >
                    👤 My Profile
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
