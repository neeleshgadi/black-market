import { useState, useRef, useEffect } from "react";
import {
  createImageObserver,
  preloadImage,
} from "../../utils/imageOptimization";
import { getImageUrl } from "../../utils/imageUtils";

const LazyImage = ({
  src,
  alt,
  className = "",
  placeholder = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+",
  fallbackIcon = null,
  ...props
}) => {
  const fullImageUrl = getImageUrl(src);
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    let observer;

    // Debug logging
    console.log("LazyImage loading:", {
      originalSrc: src,
      fullImageUrl,
      placeholder,
      isLoading,
      hasError,
    });

    if (imgRef.current && imageSrc === placeholder) {
      observer = createImageObserver((img) => {
        console.log("Image in viewport, attempting to load:", fullImageUrl);
        preloadImage(fullImageUrl)
          .then(() => {
            console.log("Image loaded successfully:", fullImageUrl);
            setImageSrc(fullImageUrl);
            setIsLoading(false);
            observer?.unobserve(img);
          })
          .catch((error) => {
            console.error("Error loading image:", fullImageUrl, error);
            setHasError(true);
            setIsLoading(false);
            observer?.unobserve(img);
          });
      });

      if (observer) {
        observer.observe(imgRef.current);
      } else {
        // Fallback for browsers without IntersectionObserver
        console.log("Using fallback loader for:", fullImageUrl);
        preloadImage(fullImageUrl)
          .then(() => {
            console.log("Fallback image loaded successfully:", fullImageUrl);
            setImageSrc(fullImageUrl);
            setIsLoading(false);
          })
          .catch((error) => {
            console.error(
              "Error in fallback image loading:",
              fullImageUrl,
              error
            );
            setHasError(true);
            setIsLoading(false);
          });
      }
    }

    return () => {
      if (observer && imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [fullImageUrl, imageSrc, placeholder]);

  if (hasError) {
    return (
      <div
        className={`bg-gray-800 flex items-center justify-center ${className}`}
        {...props}
      >
        {fallbackIcon || (
          <span className="text-gray-400 text-sm">Failed to load image</span>
        )}
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`transition-opacity duration-300 ${
        isLoading ? "opacity-50" : "opacity-100"
      } ${className}`}
      {...props}
    />
  );
};

export default LazyImage;
