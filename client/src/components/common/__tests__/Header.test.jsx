import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders, mockUser } from "../../../test/utils";
import Header from "../Header";
import { useAuth } from "../../../context/AuthContext";
import { useCart } from "../../../context/CartContext";
import { useWishlist } from "../../../context/WishlistContext";

// Mock the contexts
vi.mock("../../../context/AuthContext");
vi.mock("../../../context/CartContext");
vi.mock("../../../context/WishlistContext");

describe("Header Component", () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Default mock implementations
    useAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      logout: vi.fn(),
    });

    useCart.mockReturnValue({
      getCartItemCount: () => 0,
    });

    useWishlist.mockReturnValue({
      getWishlistCount: () => 0,
    });
  });

  it("renders navigation links", () => {
    renderWithProviders(<Header />);

    expect(screen.getByText("BLACK MARKET")).toBeInTheDocument();
    expect(screen.getByText("Aliens")).toBeInTheDocument();
    expect(screen.getByText("Sign In")).toBeInTheDocument();
  });

  it("shows cart icon with item count", () => {
    useCart.mockReturnValue({
      getCartItemCount: () => 2,
    });

    renderWithProviders(<Header />);

    expect(screen.getByText("🛒 Cart")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("shows user menu when logged in", () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: mockUser,
      logout: vi.fn(),
    });

    renderWithProviders(<Header />);

    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.queryByText("Sign In")).not.toBeInTheDocument();
  });

  it("handles mobile menu toggle", () => {
    renderWithProviders(<Header />);

    const mobileMenuButton = screen.getByLabelText("Toggle mobile menu");
    fireEvent.click(mobileMenuButton);

    // Mobile menu should be visible - check for mobile-specific elements
    const mobileLinks = screen.getAllByText("Aliens");
    expect(mobileLinks.length).toBeGreaterThan(1); // Desktop + mobile
  });

  it("navigates to cart when cart icon is clicked", () => {
    renderWithProviders(<Header />);

    const cartLink = screen.getByText("🛒 Cart").closest("a");
    expect(cartLink).toHaveAttribute("href", "/cart");
  });

  it("shows admin link for admin users", () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { ...mockUser, isAdmin: true },
      logout: vi.fn(),
    });

    renderWithProviders(<Header />);

    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("shows wishlist count when user has wishlist items", () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: mockUser,
      logout: vi.fn(),
    });

    useWishlist.mockReturnValue({
      getWishlistCount: () => 3,
    });

    renderWithProviders(<Header />);

    expect(screen.getByText("❤️ Wishlist (3)")).toBeInTheDocument();
  });
});
