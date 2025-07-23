/**
 * Utility functions for handling image URLs
 */

/**
 * Get the full image URL by prepending the API base URL if needed
 * @param {string} imagePath - The image path from the API
 * @returns {string} - The full image URL
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return "/placeholder-alien.svg";
  }

  // If it's already a full URL, return as is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // If it's a local path starting with /uploads, prepend the API URL
  if (imagePath.startsWith("/uploads")) {
    // Remove '/api' from the end of the URL if it exists
    const baseApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const apiUrl = baseApiUrl.endsWith("/api")
      ? baseApiUrl.substring(0, baseApiUrl.length - 4)
      : baseApiUrl;
    return `${apiUrl}${imagePath}`;
  }

  // For other paths, assume they're relative to the client
  return imagePath;
};

/**
 * Get a placeholder image URL based on alien properties
 * @param {Object} alien - The alien object
 * @returns {string} - Placeholder image URL
 */
export const getPlaceholderImage = (alien) => {
  // You could generate different placeholders based on faction, rarity, etc.
  return "/placeholder-alien.svg";
};
