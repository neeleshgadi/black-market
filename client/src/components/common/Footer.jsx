import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 border-t border-purple-500/20 mt-auto">
      <div className="container-responsive py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand Section */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2">
            <div className="flex items-center space-x-2 mb-3 sm:mb-4">
              <div className="text-xl sm:text-2xl">👽</div>
              <div>
                <div className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-green-400">
                  BLACK MARKET
                </div>
                <div className="text-xs text-gray-400 -mt-1">
                  Galactic Collectibles
                </div>
              </div>
            </div>
            <p className="text-gray-400 mb-3 sm:mb-4 max-w-md text-sm sm:text-base text-balance">
              Discover rare alien collectibles from across the universe. Each
              card tells a unique story from distant worlds and forgotten
              civilizations.
            </p>
            <div className="flex space-x-3 sm:space-x-4">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-600/20 rounded-full flex items-center justify-center text-purple-400 hover:bg-purple-600/30 transition-colors cursor-pointer neon-glow">
                🌌
              </div>
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-600/20 rounded-full flex items-center justify-center text-green-400 hover:bg-green-600/30 transition-colors cursor-pointer alien-glow">
                🚀
              </div>
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600/20 rounded-full flex items-center justify-center text-blue-400 hover:bg-blue-600/30 transition-colors cursor-pointer">
                ⭐
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
              Explore
            </h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <Link
                  to="/aliens"
                  className="text-gray-400 hover:text-purple-400 transition-colors text-sm sm:text-base focus-visible"
                >
                  All Aliens
                </Link>
              </li>
              <li>
                <Link
                  to="/aliens?featured=true"
                  className="text-gray-400 hover:text-purple-400 transition-colors text-sm sm:text-base focus-visible"
                >
                  Featured
                </Link>
              </li>
              <li>
                <Link
                  to="/aliens?rarity=Legendary"
                  className="text-gray-400 hover:text-purple-400 transition-colors text-sm sm:text-base focus-visible"
                >
                  Legendary
                </Link>
              </li>
              <li>
                <Link
                  to="/aliens?rarity=Epic"
                  className="text-gray-400 hover:text-purple-400 transition-colors text-sm sm:text-base focus-visible"
                >
                  Epic Cards
                </Link>
              </li>
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
              Account
            </h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <Link
                  to="/login"
                  className="text-gray-400 hover:text-green-400 transition-colors text-sm sm:text-base focus-visible"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-gray-400 hover:text-green-400 transition-colors text-sm sm:text-base focus-visible"
                >
                  Join Galaxy
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="text-gray-400 hover:text-green-400 transition-colors text-sm sm:text-base focus-visible"
                >
                  Profile
                </Link>
              </li>
              <li>
                <Link
                  to="/wishlist"
                  className="text-gray-400 hover:text-green-400 transition-colors text-sm sm:text-base focus-visible"
                >
                  Wishlist
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-gray-400 text-xs sm:text-sm text-center sm:text-left">
              &copy; 2025 Black Market - Galactic Alien Collectibles. All rights
              reserved across the universe.
            </div>
            <div className="flex flex-wrap justify-center sm:justify-end space-x-4 sm:space-x-6 text-xs sm:text-sm">
              <a
                href="#"
                className="text-gray-400 hover:text-purple-400 transition-colors focus-visible"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-purple-400 transition-colors focus-visible"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-purple-400 transition-colors focus-visible"
              >
                Galactic Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
