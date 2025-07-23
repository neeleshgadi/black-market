import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders, mockAlien } from "../../../test/utils";
import CartItem from "../CartItem";

describe("CartItem Component", () => {
  const mockCartItem = {
    alien: mockAlien,
    quantity: 2,
  };

  const mockProps = {
    item: mockCartItem,
    onUpdateQuantity: vi.fn(),
    onRemove: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders cart item information", () => {
    renderWithProviders(<CartItem {...mockProps} />);

    expect(screen.getByText("Zephyr the Cosmic Wanderer")).toBeInTheDocument();
    expect(screen.getByText("Stellar Nomads")).toBeInTheDocument();
    expect(screen.getByDisplayValue("2")).toBeInTheDocument();
  });

  it("displays correct subtotal", () => {
    renderWithProviders(<CartItem {...mockProps} />);

    // 299.99 * 2 = 599.98
    expect(screen.getByText("$599.98")).toBeInTheDocument();
  });

  it("handles quantity increase", () => {
    renderWithProviders(<CartItem {...mockProps} />);

    const increaseButton = screen.getByText("+");
    fireEvent.click(increaseButton);

    expect(mockProps.onUpdateQuantity).toHaveBeenCalledWith(mockAlien._id, 3);
  });

  it("handles quantity decrease", () => {
    renderWithProviders(<CartItem {...mockProps} />);

    const decreaseButton = screen.getByText("-");
    fireEvent.click(decreaseButton);

    expect(mockProps.onUpdateQuantity).toHaveBeenCalledWith(mockAlien._id, 1);
  });

  it("prevents quantity from going below 1", () => {
    const singleItemProps = {
      ...mockProps,
      item: { ...mockCartItem, quantity: 1 },
    };

    renderWithProviders(<CartItem {...singleItemProps} />);

    const decreaseButton = screen.getByText("-");
    fireEvent.click(decreaseButton);

    // Should call remove instead of updating to 0
    expect(mockProps.onRemove).toHaveBeenCalledWith(mockAlien._id);
  });

  it("handles direct quantity input change", () => {
    renderWithProviders(<CartItem {...mockProps} />);

    const quantityInput = screen.getByDisplayValue("2");
    fireEvent.change(quantityInput, { target: { value: "5" } });

    expect(mockProps.onUpdateQuantity).toHaveBeenCalledWith(mockAlien._id, 5);
  });

  it("handles remove item", () => {
    renderWithProviders(<CartItem {...mockProps} />);

    const removeButton = screen.getByText("Remove");
    fireEvent.click(removeButton);

    expect(mockProps.onRemove).toHaveBeenCalledWith(mockAlien._id);
  });

  it("shows confirmation dialog before removing item", () => {
    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    renderWithProviders(<CartItem {...mockProps} />);

    const removeButton = screen.getByText("Remove");
    fireEvent.click(removeButton);

    expect(confirmSpy).toHaveBeenCalledWith(
      "Are you sure you want to remove this item from your cart?"
    );
    expect(mockProps.onRemove).toHaveBeenCalledWith(mockAlien._id);

    confirmSpy.mockRestore();
  });

  it("does not remove item if confirmation is cancelled", () => {
    // Mock window.confirm to return false
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);

    renderWithProviders(<CartItem {...mockProps} />);

    const removeButton = screen.getByText("Remove");
    fireEvent.click(removeButton);

    expect(confirmSpy).toHaveBeenCalled();
    expect(mockProps.onRemove).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });

  it("displays alien image", () => {
    renderWithProviders(<CartItem {...mockProps} />);

    const image = screen.getByAltText("Zephyr the Cosmic Wanderer");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "/images/aliens/zephyr.jpg");
  });

  it("handles invalid quantity input", () => {
    renderWithProviders(<CartItem {...mockProps} />);

    const quantityInput = screen.getByDisplayValue("2");

    // Try to set invalid quantity
    fireEvent.change(quantityInput, { target: { value: "0" } });
    expect(mockProps.onRemove).toHaveBeenCalledWith(mockAlien._id);

    // Try negative quantity
    fireEvent.change(quantityInput, { target: { value: "-1" } });
    expect(mockProps.onRemove).toHaveBeenCalledWith(mockAlien._id);
  });
});
