import React from "react";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

// Simple render function for component tests that don't need full context
export function renderWithRouter(ui, options = {}) {
  function Wrapper({ children }) {
    return <BrowserRouter>{children}</BrowserRouter>;
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

// Mock data for testing
export const mockAlien = {
  _id: "1",
  name: "Zephyr the Cosmic Wanderer",
  faction: "Stellar Nomads",
  planet: "Nebula Prime",
  rarity: "Legendary",
  price: 299.99,
  image: "/images/aliens/zephyr.jpg",
  backstory: "A mysterious traveler from the outer rim...",
  abilities: ["Teleportation", "Mind Reading"],
  clothingStyle: "Ethereal Robes",
  featured: true,
  inStock: true,
};

// Re-export everything from testing-library
export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
