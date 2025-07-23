import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import PurchaseHistory from "../PurchaseHistory.jsx";
import * as orderService from "../../../services/orderService.js";

// Mock the order service
vi.mock("../../../services/orderService.js");

// Mock the child components
vi.mock("../OrderCard.jsx", () => ({
  default: ({ order }) => (
    <div data-testid="order-card">{order.orderNumber}</div>
  ),
}));

vi.mock("../../common/LoadingSpinner.jsx", () => ({
  default: () => <div data-testid="loading-spinner">Loading...</div>,
}));

describe("PurchaseHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading state initially", () => {
    orderService.getUserOrders.mockImplementation(() => new Promise(() => {}));

    render(<PurchaseHistory />);

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  it("should render empty state when no orders exist", async () => {
    orderService.getUserOrders.mockResolvedValue({
      success: true,
      data: {
        orders: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalOrders: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      },
    });

    render(<PurchaseHistory />);

    await waitFor(() => {
      expect(screen.getByText("No Orders Yet")).toBeInTheDocument();
    });
  });

  it("should render orders when they exist", async () => {
    const mockOrders = [
      {
        id: "1",
        orderNumber: "ORD-001",
        totalAmount: 100,
        orderStatus: "delivered",
        paymentStatus: "completed",
        createdAt: "2023-01-01T00:00:00Z",
        items: [],
      },
    ];

    orderService.getUserOrders.mockResolvedValue({
      success: true,
      data: {
        orders: mockOrders,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalOrders: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      },
    });

    render(<PurchaseHistory />);

    await waitFor(() => {
      expect(screen.getByTestId("order-card")).toBeInTheDocument();
      expect(screen.getByText("ORD-001")).toBeInTheDocument();
    });
  });

  it("should render error state when fetch fails", async () => {
    orderService.getUserOrders.mockResolvedValue({
      success: false,
      error: "Failed to fetch orders",
    });

    render(<PurchaseHistory />);

    await waitFor(() => {
      expect(
        screen.getByText("Error loading purchase history")
      ).toBeInTheDocument();
      expect(screen.getByText("Failed to fetch orders")).toBeInTheDocument();
    });
  });
});
