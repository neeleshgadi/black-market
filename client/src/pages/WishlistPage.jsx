import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import WishlistItem from "../components/user/WishlistItem";

const WishlistPage = () => {
  const { wishlist, loading, error, clearWishlist, loadWishlist } =
    useWishlist();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadWishlist();
    }
  }, [isAuthenticated]);

  const handleClearWishlist = async () => {
    if (
      window.confirm("Are you sure you want to clear your entire wishlist?")
    ) {
      const result = await clearWishlist();
      if (result.success) {
        // Could add toast notification here
        console.log("Wishlist cleared");
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-6xl mb-4">❤️</div>
          <h1 className="text-3xl font-bold text-white mb-4">Your Wishlist</h1>
          <p className="text-gray-400 mb-6">
            Please sign in to view and manage your wishlist.
          </p>
          <Link
            to="/login"
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded transition-colors duration-200"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col justify-center items-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-gray-400">Loading your wishlist...</p>
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
            onClick={loadWishlist}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            ❤️ Your Wishlist
          </h1>
          <p className="text-gray-400">
            {wishlist.length === 0
              ? "Your wishlist is empty"
              : `${wishlist.length} alien${
                  wishlist.length !== 1 ? "s" : ""
                } in your wishlist`}
          </p>
        </div>

        {wishlist.length > 0 && (
          <button
            onClick={handleClearWishlist}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition-colors duration-200"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Empty State */}
      {wishlist.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-8xl mb-6">💔</div>
          <h2 className="text-2xl font-bold text-gray-400 mb-4">
            Your wishlist is empty
          </h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Start exploring our galaxy of alien collectibles and add your
            favorites to your wishlist!
          </p>
          <Link
            to="/aliens"
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded transition-colors duration-200"
          >
            Explore Aliens
          </Link>
        </div>
      ) : (
        /* Wishlist Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((alien) => (
            <WishlistItem key={alien._id} alien={alien} />
          ))}
        </div>
      )}

      {/* Continue Shopping */}
      {wishlist.length > 0 && (
        <div className="text-center mt-12 pt-8 border-t border-gray-700">
          <Link
            to="/aliens"
            className="text-purple-400 hover:text-purple-300 font-semibold transition-colors duration-200"
          >
            ← Continue exploring aliens
          </Link>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
