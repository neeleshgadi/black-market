import React from "react";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { WishlistProvider } from "../context/WishlistContext";
import { ToastProvider } from "../context/ToastContext";

// Custom render function that includes all providers
export function renderWithProviders(ui, options = {}) {
  const { initialEntries = ["/"], ...renderOptions } = options;

  function Wrapper({ children }) {
    return (
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>{children}</WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Mock user data for testing
export const mockUser = {
  _id: "user1",
  email: "test@example.com",
  firstName: "John",
  lastName: "Doe",
  isAdmin: false,
  wishlist: [],
};

export const mockAdminUser = {
  _id: "admin1",
  email: "admin@example.com",
  firstName: "Admin",
  lastName: "User",
  isAdmin: true,
  wishlist: [],
};

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

export const mockCart = {
  _id: "cart1",
  user: "user1",
  items: [
    {
      alien: mockAlien,
      quantity: 2,
    },
  ],
  totalItems: 2,
};

// Re-export everything from testing-library
export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
