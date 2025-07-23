import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../utils";
import App from "../../App";

// Mock all services for E2E tests
vi.mock("../../services/alienService");
vi.mock("../../services/authService");
vi.mock("../../services/cartService");
vi.mock("../../services/orderService");
vi.mock("../../services/wishlistService");

describe("Critical User Journeys E2E Tests", () => {
  describe("Complete Purchase Journey", () => {
    it("should allow user to complete full purchase flow from homepage to order confirmation", async () => {
      const user = userEvent.setup();

      // Mock services to return successful responses
      const { getAliens, getFeaturedAliens } = await import(
        "../../services/alienService"
      );
      const { login } = await import("../../services/authService");
      const { createOrder } = await import("../../services/orderService");

      getFeaturedAliens.mockResolvedValue({
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
      });

      getAliens.mockResolvedValue({
        success: true,
        data: {
          aliens: [
            {
              _id: "1",
              name: "Zephyr the Cosmic Wanderer",
              faction: "Stellar Nomads",
              rarity: "Legendary",
              price: 299.99,
              image: "/images/aliens/zephyr.jpg",
              featured: true,
              inStock: true,
            },
          ],
          pagination: { currentPage: 1, totalPages: 1, totalCount: 1 },
        },
      });

      login.mockResolvedValue({
        success: true,
        data: {
          user: { _id: "1", email: "test@example.com", firstName: "John" },
          token: "mock-token",
        },
      });

      createOrder.mockResolvedValue({
        success: true,
        data: {
          _id: "order1",
          orderNumber: "BM123456",
          totalAmount: 299.99,
          paymentStatus: "completed",
          orderStatus: "processing",
        },
      });

      renderWithProviders(<App />);

      // Step 1: User lands on homepage
      expect(
        screen.getByText("Welcome to the Black Market")
      ).toBeInTheDocument();

      // Step 2: User explores aliens
      const exploreButton = screen.getByText("Explore Galaxies");
      await user.click(exploreButton);

      await waitFor(() => {
        expect(screen.getByText("Explore Galaxies")).toBeInTheDocument();
      });

      // Step 3: User views alien details
      await waitFor(() => {
        const viewDetailsButton = screen.getByText("View Details");
        expect(viewDetailsButton).toBeInTheDocument();
      });

      const viewDetailsButton = screen.getByText("View Details");
      await user.click(viewDetailsButton);

      // Step 4: User adds alien to cart
      await waitFor(() => {
        const addToCartButton = screen.getByText("Add to Cart");
        expect(addToCartButton).toBeInTheDocument();
      });

      const addToCartButton = screen.getByText("Add to Cart");
      await user.click(addToCartButton);

      // Step 5: User goes to cart
      await waitFor(() => {
        const cartButton = screen.getByRole("button", { name: /cart/i });
        expect(cartButton).toBeInTheDocument();
      });

      const cartButton = screen.getByRole("button", { name: /cart/i });
      await user.click(cartButton);

      // Step 6: User proceeds to checkout (should redirect to login)
      await waitFor(() => {
        const checkoutButton = screen.getByText("Proceed to Checkout");
        expect(checkoutButton).toBeInTheDocument();
      });

      const checkoutButton = screen.getByText("Proceed to Checkout");
      await user.click(checkoutButton);

      // Step 7: User logs in
      await waitFor(() => {
        expect(screen.getByText("Sign In")).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const loginButton = screen.getByRole("button", { name: "Sign In" });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(loginButton);

      // Step 8: User completes checkout
      await waitFor(() => {
        expect(screen.getByText("Checkout")).toBeInTheDocument();
      });

      // Fill shipping information
      const streetInput = screen.getByLabelText("Street Address");
      const cityInput = screen.getByLabelText("City");
      const stateInput = screen.getByLabelText("State");
      const zipInput = screen.getByLabelText("ZIP Code");

      await user.type(streetInput, "123 Main St");
      await user.type(cityInput, "Anytown");
      await user.type(stateInput, "CA");
      await user.type(zipInput, "12345");

      // Fill payment information
      const cardNumberInput = screen.getByLabelText("Card Number");
      const expiryInput = screen.getByLabelText("Expiry Date");
      const cvvInput = screen.getByLabelText("CVV");

      await user.type(cardNumberInput, "4111111111111111");
      await user.type(expiryInput, "12/25");
      await user.type(cvvInput, "123");

      // Place order
      const placeOrderButton = screen.getByText("Place Order");
      await user.click(placeOrderButton);

      // Step 9: User sees order confirmation
      await waitFor(() => {
        expect(screen.getByText("Order Confirmed!")).toBeInTheDocument();
        expect(screen.getByText("BM123456")).toBeInTheDocument();
      });

      // Verify all services were called correctly
      expect(getFeaturedAliens).toHaveBeenCalled();
      expect(getAliens).toHaveBeenCalled();
      expect(login).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
      expect(createOrder).toHaveBeenCalled();
    });
  });

  describe("User Registration and Profile Management Journey", () => {
    it("should allow user to register, update profile, and manage wishlist", async () => {
      const user = userEvent.setup();

      const { register, updateProfile } = await import(
        "../../services/authService"
      );
      const { addToWishlist, getWishlist } = await import(
        "../../services/wishlistService"
      );

      register.mockResolvedValue({
        success: true,
        data: {
          user: {
            _id: "1",
            email: "newuser@example.com",
            firstName: "New",
            lastName: "User",
          },
          token: "mock-token",
        },
      });

      updateProfile.mockResolvedValue({
        success: true,
        data: {
          _id: "1",
          email: "newuser@example.com",
          firstName: "Updated",
          lastName: "User",
        },
      });

      addToWishlist.mockResolvedValue({
        success: true,
        data: { message: "Added to wishlist" },
      });

      getWishlist.mockResolvedValue({
        success: true,
        data: [
          {
            _id: "1",
            name: "Zephyr the Cosmic Wanderer",
            faction: "Stellar Nomads",
            price: 299.99,
          },
        ],
      });

      renderWithProviders(<App />);

      // Step 1: User navigates to registration
      const registerLink = screen.getByText("Register");
      await user.click(registerLink);

      // Step 2: User fills registration form
      await waitFor(() => {
        expect(screen.getByText("Create Account")).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const firstNameInput = screen.getByLabelText("First Name");
      const lastNameInput = screen.getByLabelText("Last Name");
      const registerButton = screen.getByRole("button", {
        name: "Create Account",
      });

      await user.type(emailInput, "newuser@example.com");
      await user.type(passwordInput, "password123");
      await user.type(firstNameInput, "New");
      await user.type(lastNameInput, "User");
      await user.click(registerButton);

      // Step 3: User is redirected to homepage after registration
      await waitFor(() => {
        expect(
          screen.getByText("Welcome to the Black Market")
        ).toBeInTheDocument();
        expect(screen.getByText("New")).toBeInTheDocument(); // User name in header
      });

      // Step 4: User navigates to profile
      const profileMenu = screen.getByText("New");
      await user.click(profileMenu);

      const profileLink = screen.getByText("Profile");
      await user.click(profileLink);

      // Step 5: User updates profile
      await waitFor(() => {
        expect(screen.getByText("My Profile")).toBeInTheDocument();
      });

      const editButton = screen.getByText("Edit Profile");
      await user.click(editButton);

      const updateFirstNameInput = screen.getByDisplayValue("New");
      await user.clear(updateFirstNameInput);
      await user.type(updateFirstNameInput, "Updated");

      const saveButton = screen.getByText("Save Changes");
      await user.click(saveButton);

      // Step 6: User adds item to wishlist
      const exploreButton = screen.getByText("Explore Galaxies");
      await user.click(exploreButton);

      await waitFor(() => {
        const addToWishlistButton = screen.getByText("Add to Wishlist");
        expect(addToWishlistButton).toBeInTheDocument();
      });

      const addToWishlistButton = screen.getByText("Add to Wishlist");
      await user.click(addToWishlistButton);

      // Step 7: User views wishlist
      const wishlistLink = screen.getByText("Wishlist");
      await user.click(wishlistLink);

      await waitFor(() => {
        expect(screen.getByText("My Wishlist")).toBeInTheDocument();
        expect(
          screen.getByText("Zephyr the Cosmic Wanderer")
        ).toBeInTheDocument();
      });

      // Verify service calls
      expect(register).toHaveBeenCalled();
      expect(updateProfile).toHaveBeenCalled();
      expect(addToWishlist).toHaveBeenCalled();
      expect(getWishlist).toHaveBeenCalled();
    });
  });

  describe("Admin Management Journey", () => {
    it("should allow admin to manage alien inventory", async () => {
      const user = userEvent.setup();

      const { login } = await import("../../services/authService");
      const { createAlien, updateAlien, deleteAlien } = await import(
        "../../services/adminService"
      );

      login.mockResolvedValue({
        success: true,
        data: {
          user: {
            _id: "1",
            email: "admin@example.com",
            firstName: "Admin",
            isAdmin: true,
          },
          token: "admin-token",
        },
      });

      createAlien.mockResolvedValue({
        success: true,
        data: {
          _id: "2",
          name: "New Test Alien",
          faction: "Test Faction",
          price: 199.99,
        },
      });

      renderWithProviders(<App />);

      // Step 1: Admin logs in
      const loginLink = screen.getByText("Login");
      await user.click(loginLink);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const loginButton = screen.getByRole("button", { name: "Sign In" });

      await user.type(emailInput, "admin@example.com");
      await user.type(passwordInput, "adminpassword");
      await user.click(loginButton);

      // Step 2: Admin navigates to admin panel
      await waitFor(() => {
        const adminLink = screen.getByText("Admin Panel");
        expect(adminLink).toBeInTheDocument();
      });

      const adminLink = screen.getByText("Admin Panel");
      await user.click(adminLink);

      // Step 3: Admin adds new alien
      await waitFor(() => {
        expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
      });

      const addAlienButton = screen.getByText("Add New Alien");
      await user.click(addAlienButton);

      // Fill alien form
      const nameInput = screen.getByLabelText("Name");
      const factionInput = screen.getByLabelText("Faction");
      const priceInput = screen.getByLabelText("Price");

      await user.type(nameInput, "New Test Alien");
      await user.type(factionInput, "Test Faction");
      await user.type(priceInput, "199.99");

      const saveButton = screen.getByText("Save Alien");
      await user.click(saveButton);

      // Step 4: Verify alien was created
      await waitFor(() => {
        expect(
          screen.getByText("Alien created successfully")
        ).toBeInTheDocument();
      });

      expect(createAlien).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "New Test Alien",
          faction: "Test Faction",
          price: "199.99",
        })
      );
    });
  });

  describe("Error Handling Journey", () => {
    it("should handle network errors gracefully throughout the application", async () => {
      const user = userEvent.setup();

      const { getAliens } = await import("../../services/alienService");

      // Mock network error
      getAliens.mockRejectedValue(new Error("Network error"));

      renderWithProviders(<App />);

      // Navigate to aliens page
      const exploreButton = screen.getByText("Explore Galaxies");
      await user.click(exploreButton);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/Error loading aliens/)).toBeInTheDocument();
      });

      // Should show retry functionality
      const retryButton = screen.getByText("Retry");
      expect(retryButton).toBeInTheDocument();

      // Mock successful retry
      getAliens.mockResolvedValue({
        success: true,
        data: {
          aliens: [
            {
              _id: "1",
              name: "Zephyr the Cosmic Wanderer",
              faction: "Stellar Nomads",
              price: 299.99,
            },
          ],
          pagination: { currentPage: 1, totalPages: 1, totalCount: 1 },
        },
      });

      await user.click(retryButton);

      // Should show aliens after retry
      await waitFor(() => {
        expect(
          screen.getByText("Zephyr the Cosmic Wanderer")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Responsive Design Journey", () => {
    it("should work correctly on mobile devices", async () => {
      // Mock mobile viewport
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 375,
      });

      const user = userEvent.setup();

      renderWithProviders(<App />);

      // Test mobile navigation
      const mobileMenuButton = screen.getByRole("button", { name: /menu/i });
      expect(mobileMenuButton).toBeInTheDocument();

      await user.click(mobileMenuButton);

      // Mobile menu should be visible
      expect(screen.getByRole("navigation")).toHaveClass("block");

      // Test responsive layout
      const heroSection = screen
        .getByText("Welcome to the Black Market")
        .closest("section");
      expect(heroSection).toHaveClass("px-4");
    });
  });
});
