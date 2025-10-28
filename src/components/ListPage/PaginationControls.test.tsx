import React from "react";
import { render, screen } from "@testing-library/react";
import { PaginationControls } from "./PaginationControls";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("PaginationControls", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders nothing if totalPages <= 1", () => {
    const { container } = render(
      <PaginationControls currentPage={1} totalPages={1} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("disables Previous link on first page", () => {
    render(<PaginationControls currentPage={1} totalPages={5} />);
    const prev = screen.getByLabelText("Go to previous page");
    expect(prev).toHaveClass("disabled:pointer-events-none");
    prev.click();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("disables Next link on last page", () => {
    render(<PaginationControls currentPage={5} totalPages={5} />);
    const next = screen.getByLabelText("Go to next page");
    expect(next).toHaveClass("pointer-events-none");
    next.click();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("calls router.push with correct URL on page click", () => {
    render(<PaginationControls currentPage={2} totalPages={5} />);
    const page3 = screen.getByText("3");
    page3.click();
    expect(pushMock).toHaveBeenCalledWith("?page=3");
  });

  it("renders ellipses when pages exceed maxVisiblePages", () => {
    render(<PaginationControls currentPage={4} totalPages={10} />);
    const ellipses = screen.getAllByTestId("pagination-ellipsis");
    expect(ellipses.length).toBeGreaterThan(0);
  });

  it("renders all page numbers when totalPages <= maxVisiblePages", () => {
    render(<PaginationControls currentPage={2} totalPages={5} />);
    for (let i = 1; i <= 5; i++) {
      expect(screen.getByText(String(i))).toBeInTheDocument();
    }
  });
});
