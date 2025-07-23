import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useCart } from "../../context/CartContext.jsx";
import { useWishlist } from "../../context/WishlistContext.jsx";

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { getCartItemCount } = useCart();
  const { getWishlistCount } = useWishlist();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const cartItemCount = getCartItemCount();
  const wishlistCount = getWishlistCount();

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-gray-900/95 backdrop-blur-sm border-b border-purple-500/20 shadow-lg sticky top-0 z-50">
      <nav className="container-responsive py-3 sm:py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 group focus-visible"
          >
            <div className="text-2xl sm:text-3xl">👽</div>
            <div className="hidden xs:block">
              <div className="text-lg sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-green-400 group-hover:from-purple-300 group-hover:to-green-300 transition-all">
                BLACK MARKET
              </div>
              <div className="text-xs text-gray-400 -mt-1 hidden sm:block">
                Galactic Collectibles
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <Link
              to="/"
              className="text-gray-300 hover:text-purple-400 transition-colors font-medium focus-visible"
            >
              Home
            </Link>
            <Link
              to="/aliens"
              className="text-gray-300 hover:text-green-400 transition-colors font-medium focus-visible"
            >
              Aliens
            </Link>
            <Link
              to="/cart"
              className="text-gray-300 hover:text-blue-400 transition-colors font-medium relative focus-visible"
            >
              <span className="flex items-center">
                🛒 Cart
                {cartItemCount > 0 && (
                  <span className="ml-1 bg-purple-600 text-white text-xs rounded-full px-2 py-1 min-w-[1.25rem] h-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </span>
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {user?.isAdmin && (
                  <Link
                    to="/admin"
                    className="text-yellow-400 hover:text-yellow-300 transition-colors font-medium"
                  >
                    Admin
                  </Link>
                )}

                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-300 hover:text-purple-400 transition-colors font-medium focus-visible">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-green-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold neon-glow">
                      {(
                        user?.firstName?.[0] ||
                        user?.email?.[0] ||
                        "U"
                      ).toUpperCase()}
                    </div>
                    <span className="hidden lg:block text-sm">
                      {user?.firstName || user?.email?.split("@")[0] || "User"}
                    </span>
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  <div className="absolute right-0 mt-2 w-48 bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-purple-500/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-purple-600/20 hover:text-white transition-colors"
                      >
                        👤 Profile
                      </Link>
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-purple-600/20 hover:text-white transition-colors"
                      >
                        📦 Order History
                      </Link>
                      <Link
                        to="/wishlist"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-purple-600/20 hover:text-white transition-colors"
                      >
                        ❤️ Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                      </Link>
                      <hr className="my-2 border-gray-600" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-red-600/20 hover:text-white transition-colors"
                      >
                        🚪 Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-purple-400 transition-colors font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-all font-medium text-sm neon-glow focus-visible"
                >
                  <span className="hidden sm:inline">Join Galaxy</span>
                  <span className="sm:hidden">Join</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden text-gray-300 hover:text-purple-400 transition-colors p-2 focus-visible"
            aria-label="Toggle mobile menu"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-3 sm:mt-4 pb-3 sm:pb-4 border-t border-gray-700 fade-in">
            <div className="flex flex-col space-y-3 sm:space-y-4 pt-3 sm:pt-4">
              <Link
                to="/"
                className="text-gray-300 hover:text-purple-400 transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/aliens"
                className="text-gray-300 hover:text-green-400 transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Aliens
              </Link>
              <Link
                to="/cart"
                className="text-gray-300 hover:text-blue-400 transition-colors font-medium flex items-center justify-between focus-visible"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span>🛒 Cart</span>
                {cartItemCount > 0 && (
                  <span className="bg-purple-600 text-white text-xs rounded-full px-2 py-1 min-w-[1.25rem] h-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {isAuthenticated ? (
                <>
                  {user?.isAdmin && (
                    <Link
                      to="/admin"
                      className="text-yellow-400 hover:text-yellow-300 transition-colors font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    className="text-gray-300 hover:text-purple-400 transition-colors font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/orders"
                    className="text-gray-300 hover:text-purple-400 transition-colors font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Order History
                  </Link>
                  <Link
                    to="/wishlist"
                    className="text-gray-300 hover:text-purple-400 transition-colors font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-left text-gray-300 hover:text-red-400 transition-colors font-medium"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-300 hover:text-purple-400 transition-colors font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 text-white px-4 py-2 rounded-lg transition-all font-medium text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Join Galaxy
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
