import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../../../test/utils";
import AlienFilters from "../AlienFilters";

describe("AlienFilters Component", () => {
  const mockOnFiltersChange = vi.fn();

  const mockFilterOptions = {
    factions: ["Stellar Nomads", "Inferno Legion", "Crystal Collective"],
    planets: ["Nebula Prime", "Pyrion", "Crystal Moon"],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all filter inputs", () => {
    renderWithProviders(
      <AlienFilters
        onFiltersChange={mockOnFiltersChange}
        filterOptions={mockFilterOptions}
      />
    );

    expect(screen.getByLabelText("Faction")).toBeInTheDocument();
    expect(screen.getByLabelText("Planet")).toBeInTheDocument();
    expect(screen.getByLabelText("Rarity")).toBeInTheDocument();
    expect(screen.getByLabelText("Min Price")).toBeInTheDocument();
    expect(screen.getByLabelText("Max Price")).toBeInTheDocument();
  });

  it("calls onFiltersChange when component mounts", () => {
    renderWithProviders(
      <AlienFilters
        onFiltersChange={mockOnFiltersChange}
        filterOptions={mockFilterOptions}
      />
    );

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      faction: "",
      planet: "",
      rarity: "",
      minPrice: "",
      maxPrice: "",
    });
  });

  it("handles faction filter change", () => {
    renderWithProviders(
      <AlienFilters
        onFiltersChange={mockOnFiltersChange}
        filterOptions={mockFilterOptions}
      />
    );

    const factionSelect = screen.getByLabelText("Faction");
    fireEvent.change(factionSelect, { target: { value: "Stellar Nomads" } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      faction: "Stellar Nomads",
      planet: "",
      rarity: "",
      minPrice: "",
      maxPrice: "",
    });
  });

  it("handles price range changes", () => {
    renderWithProviders(
      <AlienFilters
        onFiltersChange={mockOnFiltersChange}
        filterOptions={mockFilterOptions}
      />
    );

    const minPriceInput = screen.getByLabelText("Min Price");
    const maxPriceInput = screen.getByLabelText("Max Price");

    fireEvent.change(minPriceInput, { target: { value: "50" } });
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      faction: "",
      planet: "",
      rarity: "",
      minPrice: "50",
      maxPrice: "",
    });

    fireEvent.change(maxPriceInput, { target: { value: "200" } });
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      faction: "",
      planet: "",
      rarity: "",
      minPrice: "50",
      maxPrice: "200",
    });
  });

  it("handles clear filters", () => {
    renderWithProviders(
      <AlienFilters
        onFiltersChange={mockOnFiltersChange}
        filterOptions={mockFilterOptions}
      />
    );

    // First set some filters
    const factionSelect = screen.getByLabelText("Faction");
    fireEvent.change(factionSelect, { target: { value: "Stellar Nomads" } });

    // Then clear them
    const clearButton = screen.getByText("Clear All");
    fireEvent.click(clearButton);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      faction: "",
      planet: "",
      rarity: "",
      minPrice: "",
      maxPrice: "",
    });
  });

  it("shows filter options in select dropdowns", () => {
    renderWithProviders(
      <AlienFilters
        onFiltersChange={mockOnFiltersChange}
        filterOptions={mockFilterOptions}
      />
    );

    const factionSelect = screen.getByLabelText("Faction");
    expect(factionSelect).toContainHTML(
      '<option value="Stellar Nomads">Stellar Nomads</option>'
    );
    expect(factionSelect).toContainHTML(
      '<option value="Inferno Legion">Inferno Legion</option>'
    );
  });

  it("displays current filter values", () => {
    renderWithProviders(
      <AlienFilters
        onFiltersChange={mockOnFiltersChange}
        filterOptions={mockFilterOptions}
      />
    );

    // Set some values
    const factionSelect = screen.getByLabelText("Faction");
    const minPriceInput = screen.getByLabelText("Min Price");

    fireEvent.change(factionSelect, { target: { value: "Stellar Nomads" } });
    fireEvent.change(minPriceInput, { target: { value: "50" } });

    expect(screen.getByDisplayValue("Stellar Nomads")).toBeInTheDocument();
    expect(screen.getByDisplayValue("50")).toBeInTheDocument();
  });
});
