import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { TicketsByOperatorChart } from "@/components/Dashboard/TicketsByOperatorChart";
import { ChartBarDefault } from "@/components/ui/chart-bar-default";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
}));

jest.mock("@/lib/api/tickets", () => ({
  getTicketsByOperator: jest.fn(() => Promise.resolve([])),
}));

jest.mock("@/components/ui/chart-bar-default", () => ({
  ChartBarDefault: jest.fn(() => <div data-testid="chart" />),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

jest.mock("@/components/EmptyComponent", () => ({
  EmptyComponent: jest.fn(() => <div data-testid="empty" />),
}));

jest.mock("@/components/ErrorComponent", () => ({
  ErrorComponent: jest.fn(() => <div data-testid="error" />),
}));

describe("TicketsByOperatorChart", () => {
  const mockData = [
    { operator: { id: "1", name: "Alice", email: "alice@test.com" }, count: 5 },
    { operator: { id: null, name: null, email: null }, count: 3 },
  ];

  const mockUseQuery = useQuery as jest.Mock;
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Poprawiony import ES Module zamiast require
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
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

    render(<TicketsByOperatorChart />);
    const loader = screen.getByTestId("loader");
    expect(loader).toBeInTheDocument();
  });

  it("renders empty state when no data", async () => {
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    render(<TicketsByOperatorChart />);
    await waitFor(() => screen.getByTestId("empty"));
    expect(screen.getByTestId("empty")).toBeInTheDocument();
  });

  it("renders chart with data", async () => {
    mockUseQuery.mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false,
    });

    render(<TicketsByOperatorChart />);
    await waitFor(() => screen.getByTestId("chart"));

    const props = getChartProps();
    expect(props.data).toEqual([
      { name: "Alice", email: "alice@test.com", count: 5 },
      { name: null, email: null, count: 3 },
    ]);
    expect(props.chartConfig.count.label).toBe("Tickets");
    expect(typeof props.onBarClick).toBe("function");
  });

  it("renders error state", async () => {
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: true,
    });

    render(<TicketsByOperatorChart />);
    await waitFor(() => screen.getByTestId("error"));
    expect(screen.getByTestId("error")).toBeInTheDocument();
  });

  it("navigates correctly when assigned operator is clicked", async () => {
    mockUseQuery.mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false,
    });

    render(<TicketsByOperatorChart />);
    const chartProps = getChartProps();

    chartProps.onBarClick("Alice");

    await waitFor(() => {
      const pushedUrl = mockPush.mock.calls[0][0] as string;
      const url = new URL(pushedUrl, "http://localhost");
      expect(url.searchParams.get("assigned_to.email")).toBe("alice@test.com");
      expect(url.searchParams.get("assigned_to")).toBeNull();
      expect(url.searchParams.get("status")).toBe("new,on_hold,in_progress");
      expect(url.searchParams.get("page")).toBe("1");
    });
  });

  it("navigates correctly when unassigned operator is clicked", async () => {
    mockUseQuery.mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false,
    });

    render(<TicketsByOperatorChart />);
    const chartProps = getChartProps();

    chartProps.onBarClick("Unassigned");

    await waitFor(() => {
      const pushedUrl = mockPush.mock.calls[0][0] as string;
      const url = new URL(pushedUrl, "http://localhost");
      expect(url.searchParams.get("assigned_to")).toBe("null");
      expect(url.searchParams.get("assigned_to.email")).toBeNull();
      expect(url.searchParams.get("status")).toBe("new,on_hold,in_progress");
      expect(url.searchParams.get("page")).toBe("1");
    });
  });
});
