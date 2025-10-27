import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { ResolvedTicketsChart } from "./ResolvedTicketsChart";
import { ChartBarInteractive } from "../ui/chart-bar-interactive";
import { useQuery } from "@tanstack/react-query";

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
}));

jest.mock("@/lib/api/tickets", () => ({
  getResolvedTicketsStats: jest.fn(),
}));

jest.mock("../ui/chart-bar-interactive", () => ({
  ChartBarInteractive: jest.fn(() => <div data-testid="chart" />),
}));

jest.mock("../EmptyComponent", () => ({
  EmptyComponent: jest.fn(() => <div data-testid="empty" />),
}));

jest.mock("../ErrorComponent", () => ({
  ErrorComponent: jest.fn(() => <div data-testid="error" />),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

describe("ResolvedTicketsChart", () => {
  const mockData = [
    { date: "2024-10-01", count: 3 },
    { date: "2024-10-02", count: 2 },
  ];

  const mockUseQuery = useQuery as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function getChartProps() {
    expect(ChartBarInteractive).toHaveBeenCalled();
    return (ChartBarInteractive as jest.Mock).mock.calls[0][0];
  }

  it("renders loading state", async () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    render(<ResolvedTicketsChart />);

    expect(screen.getByTestId("loader")).toBeInTheDocument();
  });

  it("renders chart with data", async () => {
    mockUseQuery.mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false,
    });

    render(<ResolvedTicketsChart />);

    await waitFor(() => screen.getByTestId("chart"));

    const props = getChartProps();
    expect(props.data).toEqual(mockData);
    expect(props.chartConfig.count.label).toBe("Resolved tickets");
    expect(typeof props.onBarClick).toBe("function");
  });

  it("renders empty state", async () => {
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    render(<ResolvedTicketsChart />);

    await waitFor(() => screen.getByTestId("empty"));
    expect(screen.getByTestId("empty")).toBeInTheDocument();
  });

  it("renders error state", async () => {
    const mockError = new Error("Fetch failed");
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: mockError,
    });

    render(<ResolvedTicketsChart />);

    await waitFor(() => screen.getByTestId("error"));
    expect(screen.getByTestId("error")).toBeInTheDocument();
  });
});
