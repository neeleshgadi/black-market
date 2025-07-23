import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LoadingSpinner from "../LoadingSpinner";

describe("LoadingSpinner Component", () => {
  it("renders loading spinner", () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByRole("status");
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute("aria-label", "Loading...");

    // Check for the actual spinning element inside
    const spinningElement = spinner.querySelector(".animate-spin");
    expect(spinningElement).toBeInTheDocument();
  });

  it("renders with custom size", () => {
    render(<LoadingSpinner size="large" />);

    const spinner = screen.getByRole("status");
    expect(spinner).toBeInTheDocument();

    // Check for the large size class in the spinning element
    const spinningElement = spinner.querySelector(".w-12.h-12");
    expect(spinningElement).toBeInTheDocument();
  });

  it("renders with custom message", () => {
    render(<LoadingSpinner text="Loading aliens..." />);

    expect(screen.getByText("Loading aliens...")).toBeInTheDocument();
  });

  it("renders default loading message", () => {
    render(<LoadingSpinner />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<LoadingSpinner className="custom-class" />);

    const container = screen.getByRole("status");
    expect(container).toHaveClass("custom-class");
  });
});
