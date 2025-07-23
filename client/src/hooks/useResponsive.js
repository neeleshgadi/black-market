import { useState, useEffect } from "react";

const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  const [breakpoint, setBreakpoint] = useState("sm");

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setScreenSize({ width, height });

      // Determine breakpoint based on Tailwind's default breakpoints
      if (width >= 1536) {
        setBreakpoint("2xl");
      } else if (width >= 1280) {
        setBreakpoint("xl");
      } else if (width >= 1024) {
        setBreakpoint("lg");
      } else if (width >= 768) {
        setBreakpoint("md");
      } else if (width >= 640) {
        setBreakpoint("sm");
      } else if (width >= 475) {
        setBreakpoint("xs");
      } else {
        setBreakpoint("base");
      }
    };

    // Set initial values
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = screenSize.width < 768;
  const isTablet = screenSize.width >= 768 && screenSize.width < 1024;
  const isDesktop = screenSize.width >= 1024;
  const isLargeScreen = screenSize.width >= 1280;

  const getGridCols = (mobile = 1, tablet = 2, desktop = 3, large = 4) => {
    if (isLargeScreen) return large;
    if (isDesktop) return desktop;
    if (isTablet) return tablet;
    return mobile;
  };

  const getResponsiveValue = (values) => {
    const { base, xs, sm, md, lg, xl, "2xl": xxl } = values;

    switch (breakpoint) {
      case "2xl":
        return xxl || xl || lg || md || sm || xs || base;
      case "xl":
        return xl || lg || md || sm || xs || base;
      case "lg":
        return lg || md || sm || xs || base;
      case "md":
        return md || sm || xs || base;
      case "sm":
        return sm || xs || base;
      case "xs":
        return xs || base;
      default:
        return base;
    }
  };

  return {
    screenSize,
    breakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isLargeScreen,
    getGridCols,
    getResponsiveValue,
  };
};

export default useResponsive;
