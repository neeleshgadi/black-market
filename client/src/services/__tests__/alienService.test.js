import { describe, it, expect, vi, beforeEach } from "vitest";
import * as alienService from "../alienService";
import api from "../api";

// Mock the api module
vi.mock("../api");

describe("AlienService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAliens", () => {
    it("fetches aliens with default parameters", async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            aliens: [],
            pagination: { currentPage: 1, totalPages: 1 },
          },
        },
      };
      api.get.mockResolvedValue(mockResponse);

      const result = await alienService.getAliens();

      expect(api.get).toHaveBeenCalledWith("/aliens", {
        params: {
          page: 1,
          limit: 12,
          search: "",
          faction: "",
          planet: "",
          rarity: "",
          minPrice: "",
          maxPrice: "",
          sortBy: "name",
          sortOrder: "asc",
        },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it("fetches aliens with custom filters", async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { aliens: [], pagination: {} },
        },
      };
      api.get.mockResolvedValue(mockResponse);

      const filters = {
        search: "Zephyr",
        faction: "Stellar Nomads",
        page: 2,
        limit: 6,
      };

      await alienService.getAliens(filters);

      expect(api.get).toHaveBeenCalledWith("/aliens", {
        params: expect.objectContaining({
          search: "Zephyr",
          faction: "Stellar Nomads",
          page: 2,
          limit: 6,
        }),
      });
    });

    it("handles API errors", async () => {
      const error = new Error("Network error");
      api.get.mockRejectedValue(error);

      await expect(alienService.getAliens()).rejects.toThrow("Network error");
    });
  });

  describe("getAlienById", () => {
    it("fetches alien by ID", async () => {
      const mockAlien = { _id: "1", name: "Test Alien" };
      const mockResponse = {
        data: { success: true, data: mockAlien },
      };
      api.get.mockResolvedValue(mockResponse);

      const result = await alienService.getAlienById("1");

      expect(api.get).toHaveBeenCalledWith("/aliens/1");
      expect(result).toEqual(mockResponse.data);
    });

    it("handles not found error", async () => {
      const error = { response: { status: 404 } };
      api.get.mockRejectedValue(error);

      await expect(alienService.getAlienById("999")).rejects.toEqual(error);
    });
  });

  describe("getFeaturedAliens", () => {
    it("fetches featured aliens", async () => {
      const mockResponse = {
        data: { success: true, data: [] },
      };
      api.get.mockResolvedValue(mockResponse);

      const result = await alienService.getFeaturedAliens();

      expect(api.get).toHaveBeenCalledWith("/aliens/featured");
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe("getRelatedAliens", () => {
    it("fetches related aliens", async () => {
      const mockResponse = {
        data: { success: true, data: [] },
      };
      api.get.mockResolvedValue(mockResponse);

      const result = await alienService.getRelatedAliens("1", 4);

      expect(api.get).toHaveBeenCalledWith("/aliens/1/related", {
        params: { limit: 4 },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it("uses default limit when not provided", async () => {
      const mockResponse = {
        data: { success: true, data: [] },
      };
      api.get.mockResolvedValue(mockResponse);

      await alienService.getRelatedAliens("1");

      expect(api.get).toHaveBeenCalledWith("/aliens/1/related", {
        params: { limit: 6 },
      });
    });
  });

  describe("getFilterOptions", () => {
    it("fetches filter options", async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            factions: ["Faction 1"],
            planets: ["Planet 1"],
            rarities: ["Common"],
            priceRange: { min: 0, max: 500 },
          },
        },
      };
      api.get.mockResolvedValue(mockResponse);

      const result = await alienService.getFilterOptions();

      expect(api.get).toHaveBeenCalledWith("/aliens/filter-options");
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe("searchAliens", () => {
    it("searches aliens with query", async () => {
      const mockResponse = {
        data: { success: true, data: { aliens: [], pagination: {} } },
      };
      api.get.mockResolvedValue(mockResponse);

      const result = await alienService.searchAliens("Zephyr");

      expect(api.get).toHaveBeenCalledWith("/aliens", {
        params: expect.objectContaining({
          search: "Zephyr",
        }),
      });
      expect(result).toEqual(mockResponse.data);
    });

    it("handles empty search query", async () => {
      const mockResponse = {
        data: { success: true, data: { aliens: [], pagination: {} } },
      };
      api.get.mockResolvedValue(mockResponse);

      await alienService.searchAliens("");

      expect(api.get).toHaveBeenCalledWith("/aliens", {
        params: expect.objectContaining({
          search: "",
        }),
      });
    });
  });
});
