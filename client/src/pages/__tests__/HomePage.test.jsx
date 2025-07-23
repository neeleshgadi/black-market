import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../test/utils";
import HomePage from "../HomePage";

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock alien service
vi.mock("../../services/alienService", () => ({
  getFeaturedAliens: vi.fn(() =>
    Promise.resolve({
      success: true,
      data: [
        {
          _id: "1",
          name: "Zephyr the Cosmic Wanderer",
          faction: "Stellar Nomads",
          rarity: "Legendary",
          price: 299.99,
          image: "/images/aliens/zephyr.jpg",
          featured: true,
        },
      ],
    })
  ),
}));

describe("HomePage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders hero section", async () => {
    renderWithProviders(<HomePage />);

    expect(screen.getByText("Welcome to the Black Market")).toBeInTheDocument();
    expect(
      screen.getByText(/Discover rare and exotic alien collectibles/)
    ).toBeInTheDocument();
  });

  it("renders explore galaxies button", () => {
    renderWithProviders(<HomePage />);

    const exploreButton = screen.getByText("Explore Galaxies");
    expect(exploreButton).toBeInTheDocument();
  });

  it("navigates to aliens page when explore button is clicked", () => {
    renderWithProviders(<HomePage />);

    const exploreButton = screen.getByText("Explore Galaxies");
    fireEvent.click(exploreButton);

    expect(mockNavigate).toHaveBeenCalledWith("/aliens");
  });

  it("displays featured aliens section", async () => {
    renderWithProviders(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("Featured Aliens")).toBeInTheDocument();
    });
  });

  it("loads and displays featured aliens", async () => {
    renderWithProviders(<HomePage />);

    await waitFor(() => {
      expect(
        screen.getByText("Zephyr the Cosmic Wanderer")
      ).toBeInTheDocument();
    });
  });

  it("shows loading state while fetching featured aliens", () => {
    renderWithProviders(<HomePage />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("handles error when fetching featured aliens fails", async () => {
    const { getFeaturedAliens } = await import("../../services/alienService");
    getFeaturedAliens.mockRejectedValue(new Error("Failed to fetch"));

    renderWithProviders(<HomePage />);

    await waitFor(() => {
      expect(
        screen.getByText(/error loading featured aliens/i)
      ).toBeInTheDocument();
    });
  });

  it("displays sci-fi themed styling", () => {
    renderWithProviders(<HomePage />);

    const heroSection = screen
      .getByText("Welcome to the Black Market")
      .closest("section");
    expect(heroSection).toHaveClass("bg-gradient-to-r");
  });

  it("shows call-to-action sections", () => {
    renderWithProviders(<HomePage />);

    expect(
      screen.getByText(/Start your collection today/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Browse our extensive catalog/i)
    ).toBeInTheDocument();
  });

  it("displays statistics or highlights", () => {
    renderWithProviders(<HomePage />);

    // Check for any statistics or highlights that might be displayed
    expect(
      screen.getByText(/Over \d+ unique aliens/i) ||
        screen.getByText(/Rare collectibles/i)
    ).toBeInTheDocument();
  });

  it("is responsive on mobile devices", () => {
    // Mock mobile viewport
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 375,
    });

    renderWithProviders(<HomePage />);

    const heroSection = screen
      .getByText("Welcome to the Black Market")
      .closest("section");
    expect(heroSection).toHaveClass("px-4", "sm:px-6", "lg:px-8");
  });
});
