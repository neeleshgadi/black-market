import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import CheckoutForm from "./CheckoutForm";

// Mock user data
const mockUser = {
  id: "1",
  email: "test@example.com",
  firstName: "John",
  lastName: "Doe",
};

// Mock onSubmit function
const mockOnSubmit = jest.fn();

// Wrapper component for testing
const TestWrapper = ({ children }) => <BrowserRouter>{children}</BrowserRouter>;

describe("CheckoutForm", () => {
  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  test("renders checkout form with shipping step initially", () => {
    render(
      <TestWrapper>
        <CheckoutForm
          onSubmit={mockOnSubmit}
          isProcessing={false}
          user={mockUser}
        />
      </TestWrapper>
    );

    expect(screen.getByText("Shipping Information")).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 2")).toBeInTheDocument();
    expect(screen.getByLabelText(/street address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/state/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/zip code/i)).toBeInTheDocument();
  });

  test("validates required shipping fields", async () => {
    render(
      <TestWrapper>
        <CheckoutForm
          onSubmit={mockOnSubmit}
          isProcessing={false}
          user={mockUser}
        />
      </TestWrapper>
    );

    // Try to proceed without filling required fields
    const continueButton = screen.getByText("Continue to Payment");
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(
        screen.getByText("Street address is required")
      ).toBeInTheDocument();
      expect(screen.getByText("City is required")).toBeInTheDocument();
      expect(screen.getByText("State is required")).toBeInTheDocument();
      expect(screen.getByText("ZIP code is required")).toBeInTheDocument();
    });

    // Should not proceed to payment step
    expect(screen.getByText("Shipping Information")).toBeInTheDocument();
  });

  test("proceeds to payment step with valid shipping info", async () => {
    render(
      <TestWrapper>
        <CheckoutForm
          onSubmit={mockOnSubmit}
          isProcessing={false}
          user={mockUser}
        />
      </TestWrapper>
    );

    // Fill in shipping information
    fireEvent.change(screen.getByLabelText(/street address/i), {
      target: { value: "123 Main St" },
    });
    fireEvent.change(screen.getByLabelText(/city/i), {
      target: { value: "New York" },
    });
    fireEvent.change(screen.getByLabelText(/state/i), {
      target: { value: "NY" },
    });
    fireEvent.change(screen.getByLabelText(/zip code/i), {
      target: { value: "10001" },
    });

    // Proceed to payment
    const continueButton = screen.getByText("Continue to Payment");
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText("Payment Information")).toBeInTheDocument();
      expect(screen.getByText("Step 2 of 2")).toBeInTheDocument();
    });
  });

  test("validates payment form fields", async () => {
    render(
      <TestWrapper>
        <CheckoutForm
          onSubmit={mockOnSubmit}
          isProcessing={false}
          user={mockUser}
        />
      </TestWrapper>
    );

    // First, fill shipping info and proceed to payment
    fireEvent.change(screen.getByLabelText(/street address/i), {
      target: { value: "123 Main St" },
    });
    fireEvent.change(screen.getByLabelText(/city/i), {
      target: { value: "New York" },
    });
    fireEvent.change(screen.getByLabelText(/state/i), {
      target: { value: "NY" },
    });
    fireEvent.change(screen.getByLabelText(/zip code/i), {
      target: { value: "10001" },
    });

    fireEvent.click(screen.getByText("Continue to Payment"));

    await waitFor(() => {
      expect(screen.getByText("Payment Information")).toBeInTheDocument();
    });

    // Try to submit without payment info
    const completeOrderButton = screen.getByText("Complete Order");
    fireEvent.click(completeOrderButton);

    await waitFor(() => {
      expect(
        screen.getByText("Cardholder name is required")
      ).toBeInTheDocument();
      expect(screen.getByText("Card number is required")).toBeInTheDocument();
      expect(screen.getByText("Expiry date is required")).toBeInTheDocument();
      expect(screen.getByText("CVV is required")).toBeInTheDocument();
    });
  });

  test("formats card number with spaces", async () => {
    render(
      <TestWrapper>
        <CheckoutForm
          onSubmit={mockOnSubmit}
          isProcessing={false}
          user={mockUser}
        />
      </TestWrapper>
    );

    // Navigate to payment step
    fireEvent.change(screen.getByLabelText(/street address/i), {
      target: { value: "123 Main St" },
    });
    fireEvent.change(screen.getByLabelText(/city/i), {
      target: { value: "New York" },
    });
    fireEvent.change(screen.getByLabelText(/state/i), {
      target: { value: "NY" },
    });
    fireEvent.change(screen.getByLabelText(/zip code/i), {
      target: { value: "10001" },
    });

    fireEvent.click(screen.getByText("Continue to Payment"));

    await waitFor(() => {
      expect(screen.getByText("Payment Information")).toBeInTheDocument();
    });

    // Test card number formatting
    const cardNumberInput = screen.getByLabelText(/card number/i);
    fireEvent.change(cardNumberInput, {
      target: { value: "4111111111111111" },
    });

    expect(cardNumberInput.value).toBe("4111 1111 1111 1111");
  });

  test("submits form with valid data", async () => {
    render(
      <TestWrapper>
        <CheckoutForm
          onSubmit={mockOnSubmit}
          isProcessing={false}
          user={mockUser}
        />
      </TestWrapper>
    );

    // Fill shipping information
    fireEvent.change(screen.getByLabelText(/street address/i), {
      target: { value: "123 Main St" },
    });
    fireEvent.change(screen.getByLabelText(/city/i), {
      target: { value: "New York" },
    });
    fireEvent.change(screen.getByLabelText(/state/i), {
      target: { value: "NY" },
    });
    fireEvent.change(screen.getByLabelText(/zip code/i), {
      target: { value: "10001" },
    });

    // Proceed to payment
    fireEvent.click(screen.getByText("Continue to Payment"));

    await waitFor(() => {
      expect(screen.getByText("Payment Information")).toBeInTheDocument();
    });

    // Fill payment information
    fireEvent.change(screen.getByLabelText(/cardholder name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/card number/i), {
      target: { value: "4111111111111111" },
    });
    fireEvent.change(screen.getByLabelText(/expiry date/i), {
      target: { value: "12/25" },
    });
    fireEvent.change(screen.getByLabelText(/cvv/i), {
      target: { value: "123" },
    });

    // Submit form
    fireEvent.click(screen.getByText("Complete Order"));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        shippingAddress: {
          street: "123 Main St",
          city: "New York",
          state: "NY",
          zipCode: "10001",
          country: "United States",
        },
        paymentMethod: {
          cardNumber: "4111 1111 1111 1111",
          expiryDate: "12/25",
          cvv: "123",
          cardholderName: "John Doe",
        },
      });
    });
  });

  test("shows processing state", () => {
    render(
      <TestWrapper>
        <CheckoutForm
          onSubmit={mockOnSubmit}
          isProcessing={true}
          user={mockUser}
        />
      </TestWrapper>
    );

    // Should show processing text on button
    expect(screen.getByText("Processing...")).toBeInTheDocument();
  });
});
