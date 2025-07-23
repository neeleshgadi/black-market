import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithRouter, mockAlien } from "../../../test/simpleUtils";
import AlienCard from "../AlienCard";
import { useCart } from "../../../context/CartContext";

// Mock the useCart hook
vi.mock("../../../context/CartContext");

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock alien data
const mockAlienData = {
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

describe("AlienCard Component", () => {
  const mockAddToCart = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    useCart.mockReturnValue({
      addToCart: mockAddToCart,
    });
  });

  it("renders alien information correctly", () => {
    renderWithRouter(<AlienCard alien={mockAlienData} />);

    expect(screen.getByText("Zephyr the Cosmic Wanderer")).toBeInTheDocument();
    expect(screen.getByText("Stellar Nomads")).toBeInTheDocument();
    expect(screen.getByText("$299.99")).toBeInTheDocument();
    expect(screen.getByText("Legendary")).toBeInTheDocument();
  });

  it("displays alien image with correct alt text", () => {
    renderWithRouter(<AlienCard alien={mockAlienData} />);

    const image = screen.getByAltText("Zephyr the Cosmic Wanderer");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "/images/aliens/zephyr.jpg");
  });

  it("shows rarity badge with correct styling", () => {
    renderWithRouter(<AlienCard alien={mockAlienData} />);

    const rarityBadge = screen.getByText("Legendary");
    expect(rarityBadge).toBeInTheDocument();
    expect(rarityBadge).toHaveClass("bg-gradient-to-r");
  });

  it('handles "View Details" button click', () => {
    renderWithRouter(<AlienCard alien={mockAlienData} />);

    const viewDetailsButton = screen.getByText("View Details");
    fireEvent.click(viewDetailsButton);

    expect(mockNavigate).toHaveBeenCalledWith("/aliens/1");
  });

  it('handles "Add to Cart" button click', () => {
    renderWithRouter(<AlienCard alien={mockAlienData} />);

    const addToCartButton = screen.getByText("Add to Cart");
    fireEvent.click(addToCartButton);

    expect(mockAddToCart).toHaveBeenCalledWith(mockAlienData, 1);
  });

  it('shows "Out of Stock" when alien is not in stock', () => {
    const outOfStockAlien = { ...mockAlienData, inStock: false };
    renderWithRouter(<AlienCard alien={outOfStockAlien} />);

    expect(screen.getByText("Out of Stock")).toBeInTheDocument();
    expect(screen.queryByText("Add to Cart")).not.toBeInTheDocument();
  });

  it("shows featured badge for featured aliens", () => {
    renderWithRouter(<AlienCard alien={mockAlienData} />);

    expect(screen.getByText("Featured")).toBeInTheDocument();
  });

  it("does not show featured badge for non-featured aliens", () => {
    const nonFeaturedAlien = { ...mockAlienData, featured: false };
    renderWithRouter(<AlienCard alien={nonFeaturedAlien} />);

    expect(screen.queryByText("Featured")).not.toBeInTheDocument();
  });

  it("handles image loading error", () => {
    renderWithRouter(<AlienCard alien={mockAlienData} />);

    const image = screen.getByAltText("Zephyr the Cosmic Wanderer");

    // Simulate image error
    fireEvent.error(image);

    // Should still be in document (error handling might set a fallback)
    expect(image).toBeInTheDocument();
  });
});
