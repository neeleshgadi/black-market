import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../../test/utils";
import LoginForm from "../LoginForm";

// Mock the useAuth hook
const mockLogin = vi.fn();
vi.mock("../../../hooks/useAuth", () => ({
  default: () => ({
    login: mockLogin,
    loading: false,
    error: null,
  }),
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ children, to, ...props }) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  };
});

describe("LoginForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders login form fields", () => {
    renderWithProviders(<LoginForm />);

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
  });

  it("validates required fields", async () => {
    renderWithProviders(<LoginForm />);

    const submitButton = screen.getByRole("button", { name: "Sign In" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Email is required")).toBeInTheDocument();
      expect(screen.getByText("Password is required")).toBeInTheDocument();
    });
  });

  it("validates email format", async () => {
    renderWithProviders(<LoginForm />);

    const emailInput = screen.getByLabelText("Email");
    const submitButton = screen.getByRole("button", { name: "Sign In" });

    fireEvent.change(emailInput, { target: { value: "invalid-email" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Please enter a valid email")
      ).toBeInTheDocument();
    });
  });

  it("submits form with valid data", async () => {
    mockLogin.mockResolvedValue({ success: true });

    renderWithProviders(<LoginForm />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: "Sign In" });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });
  });

  it("shows loading state during submission", async () => {
    vi.doMock("../../../hooks/useAuth", () => ({
      default: () => ({
        login: mockLogin,
        loading: true,
        error: null,
      }),
    }));

    renderWithProviders(<LoginForm />);

    const submitButton = screen.getByRole("button", { name: "Signing In..." });
    expect(submitButton).toBeDisabled();
  });

  it("displays error message on login failure", () => {
    vi.doMock("../../../hooks/useAuth", () => ({
      default: () => ({
        login: mockLogin,
        loading: false,
        error: "Invalid credentials",
      }),
    }));

    renderWithProviders(<LoginForm />);

    expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
  });

  it("shows password visibility toggle", () => {
    renderWithProviders(<LoginForm />);

    const passwordInput = screen.getByLabelText("Password");
    const toggleButton = screen.getByRole("button", { name: /show password/i });

    expect(passwordInput).toHaveAttribute("type", "password");

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "text");
  });

  it("has link to registration page", () => {
    renderWithProviders(<LoginForm />);

    const registerLink = screen.getByText("Sign up here");
    expect(registerLink).toHaveAttribute("href", "/register");
  });

  it("redirects after successful login", async () => {
    mockLogin.mockResolvedValue({ success: true });

    renderWithProviders(<LoginForm />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: "Sign In" });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });
});
