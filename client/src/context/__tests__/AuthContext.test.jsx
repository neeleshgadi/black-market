import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "../AuthContext";
import * as authService from "../../services/authService";

// Mock auth service
vi.mock("../../services/authService");

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
vi.stubGlobal("localStorage", localStorageMock);

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

  describe("useAuth hook", () => {
    it("provides initial state", () => {
      authService.getToken.mockReturnValue(null);

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it("loads user on mount when token exists", async () => {
      const mockUser = { _id: "1", email: "test@example.com" };
      authService.getToken.mockReturnValue("valid-token");
      authService.getProfile.mockResolvedValue({
        success: true,
        data: mockUser,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        // Wait for useEffect to complete
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it("handles login successfully", async () => {
      const mockUser = { _id: "1", email: "test@example.com" };
      const credentials = { email: "test@example.com", password: "password" };

      authService.login.mockResolvedValue({
        success: true,
        data: { user: mockUser, token: "new-token" },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login(credentials);
      });

      expect(authService.login).toHaveBeenCalledWith(credentials);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it("handles login failure", async () => {
      const credentials = { email: "test@example.com", password: "wrong" };
      const error = new Error("Invalid credentials");

      authService.login.mockRejectedValue(error);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login(credentials);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBe("Invalid credentials");
    });

    it("handles registration successfully", async () => {
      const mockUser = { _id: "1", email: "test@example.com" };
      const userData = {
        email: "test@example.com",
        password: "password",
        firstName: "John",
        lastName: "Doe",
      };

      authService.register.mockResolvedValue({
        success: true,
        data: { user: mockUser, token: "new-token" },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.register(userData);
      });

      expect(authService.register).toHaveBeenCalledWith(userData);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it("handles logout", async () => {
      // First set up authenticated state
      const mockUser = { _id: "1", email: "test@example.com" };
      authService.getToken.mockReturnValue("valid-token");
      authService.getProfile.mockResolvedValue({
        success: true,
        data: mockUser,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Now logout
      await act(async () => {
        result.current.logout();
      });

      expect(authService.logout).toHaveBeenCalled();
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it("updates user profile", async () => {
      const initialUser = {
        _id: "1",
        email: "test@example.com",
        firstName: "John",
      };
      const updatedUser = { ...initialUser, firstName: "Jane" };
      const updateData = { firstName: "Jane" };

      // Set up initial authenticated state
      authService.getToken.mockReturnValue("valid-token");
      authService.getProfile.mockResolvedValue({
        success: true,
        data: initialUser,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Mock update profile
      authService.updateProfile.mockResolvedValue({
        success: true,
        data: updatedUser,
      });

      await act(async () => {
        await result.current.updateProfile(updateData);
      });

      expect(authService.updateProfile).toHaveBeenCalledWith(updateData);
      expect(result.current.user).toEqual(updatedUser);
    });

    it("handles loading states correctly", async () => {
      authService.getToken.mockReturnValue(null);

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.loading).toBe(false);

      const slowLogin = new Promise((resolve) =>
        setTimeout(
          () =>
            resolve({
              success: true,
              data: { user: { _id: "1" }, token: "token" },
            }),
          100
        )
      );
      authService.login.mockReturnValue(slowLogin);

      act(() => {
        result.current.login({
          email: "test@example.com",
          password: "password",
        });
      });

      expect(result.current.loading).toBe(true);

      await act(async () => {
        await slowLogin;
      });

      expect(result.current.loading).toBe(false);
    });

    it("clears error on successful operations", async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      // First cause an error
      authService.login.mockRejectedValue(new Error("Login failed"));

      await act(async () => {
        await result.current.login({
          email: "test@example.com",
          password: "wrong",
        });
      });

      expect(result.current.error).toBe("Login failed");

      // Then perform successful operation
      authService.login.mockResolvedValue({
        success: true,
        data: { user: { _id: "1" }, token: "token" },
      });

      await act(async () => {
        await result.current.login({
          email: "test@example.com",
          password: "correct",
        });
      });

      expect(result.current.error).toBeNull();
    });
  });
});
