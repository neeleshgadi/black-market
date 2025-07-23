import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../test/utils";
import AlienListPage from "../AlienListPage";

// Mock alien service
const mockGetAliens = vi.fn();
const mockGetFilterOptions = vi.fn();

vi.mock("../../services/alienService", () => ({
  getAliens: mockGetAliens,
  getFilterOptions: mockGetFilterOptions,
}));

const mockAliens = [
  {
    _id: "1",
    name: "Zephyr the Cosmic Wanderer",
    faction: "Stellar Nomads",
    planet: "Nebula Prime",
    rarity: "Legendary",
    price: 299.99,
    image: "/images/aliens/zephyr.jpg",
    featured: true,
    inStock: true,
  },
  {
    _id: "2",
    name: "Blaze the Fire Warrior",
    faction: "Inferno Legion",
    planet: "Pyrion",
    rarity: "Epic",
    price: 199.99,
    image: "/images/aliens/blaze.jpg",
    featured: false,
    inStock: true,
  },
];

const mockFilterOptions = {
  factions: ["Stellar Nomads", "Inferno Legion"],
  planets: ["Nebula Prime", "Pyrion"],
  rarities: ["Common", "Rare", "Epic", "Legendary"],
  priceRange: { min: 0, max: 500 },
};

describe("AlienListPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAliens.mockResolvedValue({
      success: true,
      data: {
        aliens: mockAliens,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalCount: 2,
          hasNextPage: false,
          hasPrevPage: false,
          limit: 12,
        },
      },
    });
    mockGetFilterOptions.mockResolvedValue({
      success: true,
      data: mockFilterOptions,
    });
  });

  it("renders page title and description", async () => {
    renderWithProviders(<AlienListPage />);

    expect(screen.getByText("Explore Galaxies")).toBeInTheDocument();
    expect(
      screen.getByText(/Discover rare and exotic alien collectibles/)
    ).toBeInTheDocument();
  });

  it("loads and displays aliens", async () => {
    renderWithProviders(<AlienListPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Zephyr the Cosmic Wanderer")
      ).toBeInTheDocument();
      expect(screen.getByText("Blaze the Fire Warrior")).toBeInTheDocument();
    });
  });

  it("displays filter options", async () => {
    renderWithProviders(<AlienListPage />);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("Search aliens...")
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Faction")).toBeInTheDocument();
      expect(screen.getByLabelText("Rarity")).toBeInTheDocument();
    });
  });

  it("handles search functionality", async () => {
    renderWithProviders(<AlienListPage />);

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText("Search aliens...");
      fireEvent.change(searchInput, { target: { value: "Zephyr" } });
    });

    await waitFor(() => {
      expect(mockGetAliens).toHaveBeenCalledWith(
        expect.objectContaining({ search: "Zephyr" })
      );
    });
  });

  it("handles faction filter", async () => {
    renderWithProviders(<AlienListPage />);

    await waitFor(() => {
      const factionSelect = screen.getByLabelText("Faction");
      fireEvent.change(factionSelect, { target: { value: "Stellar Nomads" } });
    });

    await waitFor(() => {
      expect(mockGetAliens).toHaveBeenCalledWith(
        expect.objectContaining({ faction: "Stellar Nomads" })
      );
    });
  });

  it("handles price range filter", async () => {
    renderWithProviders(<AlienListPage />);

    await waitFor(() => {
      const minPriceInput = screen.getByLabelText("Min Price");
      const maxPriceInput = screen.getByLabelText("Max Price");

      fireEvent.change(minPriceInput, { target: { value: "100" } });
      fireEvent.change(maxPriceInput, { target: { value: "300" } });
    });

    await waitFor(() => {
      expect(mockGetAliens).toHaveBeenCalledWith(
        expect.objectContaining({ minPrice: "100", maxPrice: "300" })
      );
    });
  });

  it("displays no results message when no aliens found", async () => {
    mockGetAliens.mockResolvedValue({
      success: true,
      data: {
        aliens: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalCount: 0,
          hasNextPage: false,
          hasPrevPage: false,
          limit: 12,
        },
      },
    });

    renderWithProviders(<AlienListPage />);

    await waitFor(() => {
      expect(screen.getByText(/No aliens found/)).toBeInTheDocument();
    });
  });

  it("handles pagination", async () => {
    mockGetAliens.mockResolvedValue({
      success: true,
      data: {
        aliens: mockAliens,
        pagination: {
          currentPage: 1,
          totalPages: 3,
          totalCount: 30,
          hasNextPage: true,
          hasPrevPage: false,
          limit: 12,
        },
      },
    });

    renderWithProviders(<AlienListPage />);

    await waitFor(() => {
      const nextButton = screen.getByText("Next");
      expect(nextButton).toBeInTheDocument();
      fireEvent.click(nextButton);
    });

    await waitFor(() => {
      expect(mockGetAliens).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2 })
      );
    });
  });

  it("shows loading state", () => {
    renderWithProviders(<AlienListPage />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("handles error state", async () => {
    mockGetAliens.mockRejectedValue(new Error("Failed to fetch aliens"));

    renderWithProviders(<AlienListPage />);

    await waitFor(() => {
      expect(screen.getByText(/Error loading aliens/)).toBeInTheDocument();
    });
  });

  it("clears filters when clear button is clicked", async () => {
    renderWithProviders(<AlienListPage />);

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText("Search aliens...");
      fireEvent.change(searchInput, { target: { value: "test" } });
    });

    await waitFor(() => {
      const clearButton = screen.getByText("Clear Filters");
      fireEvent.click(clearButton);
    });

    await waitFor(() => {
      expect(mockGetAliens).toHaveBeenCalledWith(
        expect.objectContaining({
          search: "",
          faction: "",
          planet: "",
          rarity: "",
          minPrice: "",
          maxPrice: "",
        })
      );
    });
  });

  it("displays results count", async () => {
    renderWithProviders(<AlienListPage />);

    await waitFor(() => {
      expect(screen.getByText(/Showing 2 of 2 aliens/)).toBeInTheDocument();
    });
  });
});
