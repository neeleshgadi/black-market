// Image optimization utilities for better performance
import { useState, useEffect } from "react";

/**
 * Lazy loading intersection observer for images
 */
export const createImageObserver = (callback) => {
  if (!("IntersectionObserver" in window)) {
    // Fallback for browsers without IntersectionObserver
    return null;
  }

  return new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback(entry.target);
        }
      });
    },
    {
      rootMargin: "50px 0px", // Start loading 50px before the image enters viewport
      threshold: 0.01,
    }
  );
};

/**
 * Preload critical images
 */
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Generate responsive image URLs based on screen size
 */
export const getResponsiveImageUrl = (baseUrl, width = 400) => {
  // If using a CDN or image service, you can modify URLs for different sizes
  // For now, return the original URL
  return baseUrl;
};

/**
 * Convert image to WebP format if supported
 */
export const getOptimizedImageFormat = (originalUrl) => {
  // Check if browser supports WebP
  const supportsWebP = (() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0;
  })();

  if (
    (supportsWebP && originalUrl.includes(".jpg")) ||
    originalUrl.includes(".png")
  ) {
    // In a real implementation, you'd have WebP versions of your images
    // For now, return the original URL
    return originalUrl;
  }

  return originalUrl;
};

/**
 * Lazy loading hook for React components
 */
export const useLazyImage = (src, placeholder = "") => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [imageRef, setImageRef] = useState(null);

  useEffect(() => {
    let observer;

    if (imageRef && imageSrc === placeholder) {
      observer = createImageObserver((img) => {
        preloadImage(src)
          .then(() => {
            setImageSrc(src);
            observer?.unobserve(img);
          })
          .catch(() => {
            // Handle error - maybe set a fallback image
            setImageSrc(src); // Still try to load the original
            observer?.unobserve(img);
          });
      });

      observer.observe(imageRef);
    }

    return () => {
      if (observer && imageRef) {
        observer.unobserve(imageRef);
      }
    };
  }, [imageRef, src, imageSrc, placeholder]);

  return [imageSrc, setImageRef];
};
