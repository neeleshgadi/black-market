import { describe, it, expect, vi, beforeEach } from "vitest";
import * as authService from "../authService";
import api from "../api";

// Mock the api module
vi.mock("../api");

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
vi.stubGlobal("localStorage", localStorageMock);

describe("AuthService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("register", () => {
    it("registers a new user successfully", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
      };

      const mockResponse = {
        data: {
          success: true,
          data: {
            user: { ...userData, _id: "1" },
            token: "mock-token",
          },
        },
      };

      api.post.mockResolvedValue(mockResponse);

      const result = await authService.register(userData);

      expect(api.post).toHaveBeenCalledWith("/auth/register", userData);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "token",
        "mock-token"
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("handles registration errors", async () => {
      const userData = { email: "test@example.com", password: "weak" };
      const error = {
        response: {
          data: { success: false, error: { code: "VALIDATION_ERROR" } },
        },
      };

      api.post.mockRejectedValue(error);

      await expect(authService.register(userData)).rejects.toEqual(error);
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("logs in user successfully", async () => {
      const credentials = {
        email: "test@example.com",
        password: "password123",
      };

      const mockResponse = {
        data: {
          success: true,
          data: {
            user: { ...credentials, _id: "1" },
            token: "mock-token",
          },
        },
      };

      api.post.mockResolvedValue(mockResponse);

      const result = await authService.login(credentials);

      expect(api.post).toHaveBeenCalledWith("/auth/login", credentials);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "token",
        "mock-token"
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("handles login errors", async () => {
      const credentials = { email: "test@example.com", password: "wrong" };
      const error = {
        response: {
          data: { success: false, error: { code: "INVALID_CREDENTIALS" } },
        },
      };

      api.post.mockRejectedValue(error);

      await expect(authService.login(credentials)).rejects.toEqual(error);
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });
  });

  describe("logout", () => {
    it("removes token from localStorage", () => {
      authService.logout();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith("token");
    });
  });

  describe("getProfile", () => {
    it("fetches user profile", async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { _id: "1", email: "test@example.com" },
        },
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await authService.getProfile();

      expect(api.get).toHaveBeenCalledWith("/auth/profile");
      expect(result).toEqual(mockResponse.data);
    });

    it("handles unauthorized error", async () => {
      const error = { response: { status: 401 } };
      api.get.mockRejectedValue(error);

      await expect(authService.getProfile()).rejects.toEqual(error);
    });
  });

  describe("updateProfile", () => {
    it("updates user profile", async () => {
      const updateData = {
        firstName: "Jane",
        lastName: "Smith",
      };

      const mockResponse = {
        data: {
          success: true,
          data: { _id: "1", ...updateData },
        },
      };

      api.put.mockResolvedValue(mockResponse);

      const result = await authService.updateProfile(updateData);

      expect(api.put).toHaveBeenCalledWith("/auth/profile", updateData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe("getToken", () => {
    it("returns token from localStorage", () => {
      localStorageMock.getItem.mockReturnValue("stored-token");

      const token = authService.getToken();

      expect(localStorageMock.getItem).toHaveBeenCalledWith("token");
      expect(token).toBe("stored-token");
    });

    it("returns null when no token exists", () => {
      localStorageMock.getItem.mockReturnValue(null);

      const token = authService.getToken();

      expect(token).toBeNull();
    });
  });

  describe("isAuthenticated", () => {
    it("returns true when token exists", () => {
      localStorageMock.getItem.mockReturnValue("valid-token");

      const isAuth = authService.isAuthenticated();

      expect(isAuth).toBe(true);
    });

    it("returns false when no token exists", () => {
      localStorageMock.getItem.mockReturnValue(null);

      const isAuth = authService.isAuthenticated();

      expect(isAuth).toBe(false);
    });
  });

  describe("setAuthToken", () => {
    it("sets authorization header when token exists", () => {
      localStorageMock.getItem.mockReturnValue("test-token");

      authService.setAuthToken();

      expect(api.defaults.headers.common["Authorization"]).toBe(
        "Bearer test-token"
      );
    });

    it("removes authorization header when no token exists", () => {
      localStorageMock.getItem.mockReturnValue(null);

      authService.setAuthToken();

      expect(api.defaults.headers.common["Authorization"]).toBeUndefined();
    });
  });
});
