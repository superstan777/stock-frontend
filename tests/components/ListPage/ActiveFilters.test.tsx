import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ActiveFilters } from "../../../src/components/ListPage/ActiveFilters";
import { useRouter, useSearchParams } from "next/navigation";
import { formatLabel } from "@/lib/utils";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock("@/lib/utils", () => ({
  formatLabel: jest.fn((key: string) => key.toUpperCase()),
}));

jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children, onRemove }: any) => (
    <div data-testid="badge" onClick={onRemove}>
      {children}
    </div>
  ),
}));

describe("ActiveFilters", () => {
  const pushMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
  });

  it("returns null when there are no filters", () => {
    (useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams("page=2")
    );

    const { container } = render(<ActiveFilters />);
    expect(container.firstChild).toBeNull();
  });

  it("renders a single filter badge correctly", () => {
    (useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams("status=open")
    );

    render(<ActiveFilters />);

    expect(screen.getByText("STATUS:")).toBeInTheDocument();
    expect(screen.getByText("open")).toBeInTheDocument();
    expect(screen.getAllByTestId("badge")).toHaveLength(1);
  });

  it("renders multiple values for one filter", () => {
    (useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams("status=open,closed")
    );

    render(<ActiveFilters />);

    expect(screen.getByText("STATUS:")).toBeInTheDocument();
    expect(screen.getByText("open")).toBeInTheDocument();
    expect(screen.getByText("closed")).toBeInTheDocument();

    expect(screen.getAllByTestId("badge")).toHaveLength(3);
  });

  it("handles removing a single filter value", () => {
    (useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams("status=open,closed&page=2")
    );

    render(<ActiveFilters />);

    const openBadge = screen.getByText("open");
    fireEvent.click(openBadge);

    expect(pushMock).toHaveBeenCalledWith("?status=closed&page=1");
  });

  it("handles removing all values of a filter", () => {
    (useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams("status=open&page=3")
    );

    render(<ActiveFilters />);

    const mainBadge = screen.getByText("STATUS:");
    fireEvent.click(mainBadge);

    expect(pushMock).toHaveBeenCalledWith("?page=1");
  });

  it("calls formatLabel for every filter key", () => {
    (useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams("status=open,closed&priority=high")
    );

    render(<ActiveFilters />);

    expect(formatLabel).toHaveBeenCalledWith("status");
    expect(formatLabel).toHaveBeenCalledWith("priority");
  });
});
