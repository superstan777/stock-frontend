import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { TicketsByDayChart } from "./TicketsByDayChart";
import { ChartBarDefault } from "../ui/chart-bar-default";
import { useQuery } from "@tanstack/react-query";

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
}));

jest.mock("@/lib/api/tickets", () => ({
  getOpenTicketsStats: jest.fn(() => Promise.resolve([])),
}));

jest.mock("../ui/chart-bar-default", () => ({
  ChartBarDefault: jest.fn(() => <div data-testid="chart" />),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

jest.mock("../EmptyComponent", () => ({
  EmptyComponent: jest.fn(() => <div data-testid="empty" />),
}));

jest.mock("../ErrorComponent", () => ({
  ErrorComponent: jest.fn(() => <div data-testid="error" />),
}));

describe("TicketsByDayChart", () => {
  const mockData = [
    { date: "2024-10-01", count: 3 },
    { date: "2024-10-02", count: 2 },
  ];

  const mockUseQuery = useQuery as jest.Mock;
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    const mockUseRouter = require("next/navigation").useRouter;
    mockUseRouter.mockReturnValue({ push: mockPush });
  });

  function getChartProps() {
    expect(ChartBarDefault).toHaveBeenCalled();
    return (ChartBarDefault as jest.Mock).mock.calls[0][0];
  }

  it("renders loader when loading", () => {
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: true,
      isError: false,
    });

    render(<TicketsByDayChart />);
    const loader = screen.getByTestId("loader");
    expect(loader).toBeInTheDocument();
  });

  it("renders empty state when no data", async () => {
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    render(<TicketsByDayChart />);
    await waitFor(() => screen.getByTestId("empty"));
    expect(screen.getByTestId("empty")).toBeInTheDocument();
  });

  it("renders chart with data", async () => {
    mockUseQuery.mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false,
    });

    render(<TicketsByDayChart />);
    await waitFor(() => screen.getByTestId("chart"));

    const props = getChartProps();
    expect(props.data).toEqual(mockData);
    expect(props.chartConfig.count.label).toBe("Open tickets");
    expect(typeof props.onBarClick).toBe("function");
  });

  it("renders error state", async () => {
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: true,
    });

    render(<TicketsByDayChart />);
    await waitFor(() => screen.getByTestId("error"));
    expect(screen.getByTestId("error")).toBeInTheDocument();
  });

  it("navigates correctly when bar is clicked", async () => {
    const mockDataSingle = [{ date: "2024-10-01", count: 5 }];
    mockUseQuery.mockReturnValue({
      data: mockDataSingle,
      isLoading: false,
      isError: false,
    });

    render(<TicketsByDayChart />);

    const handleClick = (ChartBarDefault as jest.Mock).mock.calls[0][0]
      .onBarClick;
    handleClick("2024-10-01");

    await waitFor(() => {
      // Parsujemy query params
      const pushedUrl = mockPush.mock.calls[0][0] as string;
      const url = new URL(pushedUrl, "http://localhost");
      expect(url.searchParams.get("estimated_resolution_date")).toBe(
        "2024-10-01"
      );
      expect(url.searchParams.get("status")).toBe("New,On Hold,In Progress");
      expect(url.searchParams.get("page")).toBe("1");
    });
  });

  it("handles No ETA bar click correctly", async () => {
    const mockDataSingle = [{ date: "No ETA", count: 2 }];
    mockUseQuery.mockReturnValue({
      data: mockDataSingle,
      isLoading: false,
      isError: false,
    });

    render(<TicketsByDayChart />);

    const handleClick = (ChartBarDefault as jest.Mock).mock.calls[0][0]
      .onBarClick;
    handleClick("No ETA");

    await waitFor(() => {
      const pushedUrl = mockPush.mock.calls[0][0] as string;
      const url = new URL(pushedUrl, "http://localhost");
      expect(url.searchParams.get("estimated_resolution_date")).toBe("null");
      expect(url.searchParams.get("status")).toBe("New,On Hold,In Progress");
      expect(url.searchParams.get("page")).toBe("1");
    });
  });
});
