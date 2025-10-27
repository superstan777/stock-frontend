import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { NewTicketsTable } from "@/components/Dashboard/NewTicketsTable";
import { DataTable } from "@/components/ListPage/DataTable";
import { TICKET_COLUMNS } from "@/lib/consts/tickets";
import { useQuery } from "@tanstack/react-query";

jest.mock("@/lib/api/tickets", () => ({
  getNewTickets: jest.fn(() => Promise.resolve({ data: [] })),
}));

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
}));

jest.mock("@/components/ListPage/DataTable", () => ({
  DataTable: jest.fn(() => <div data-testid="data-table" />),
}));

const mockData = [
  { id: "1", title: "Test Ticket 1", status: "New" },
  { id: "2", title: "Test Ticket 2", status: "New" },
];

describe("NewTicketsTable", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function getDataTableProps() {
    expect(DataTable).toHaveBeenCalled();
    return (DataTable as jest.Mock).mock.calls[0][0];
  }

  it("renders loading state", async () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<NewTicketsTable />);

    await waitFor(() => screen.getByTestId("data-table"));

    const props = getDataTableProps();
    expect(props).toEqual(
      expect.objectContaining({
        data: undefined,
        isLoading: true,
        error: null,
        columns: TICKET_COLUMNS,
        entity: "ticket",
      })
    );
  });

  it("renders DataTable with data", async () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    });

    render(<NewTicketsTable />);

    await waitFor(() => screen.getByTestId("data-table"));

    const props = getDataTableProps();
    expect(props).toEqual(
      expect.objectContaining({
        data: mockData,
        isLoading: false,
        error: null,
        columns: TICKET_COLUMNS,
        entity: "ticket",
      })
    );
  });

  it("renders error state", async () => {
    const mockError = new Error("Fetch failed");
    (useQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
    });

    render(<NewTicketsTable />);

    await waitFor(() => screen.getByTestId("data-table"));

    const props = getDataTableProps();
    expect(props).toEqual(
      expect.objectContaining({
        data: undefined,
        isLoading: false,
        error: mockError,
        columns: TICKET_COLUMNS,
        entity: "ticket",
      })
    );
  });
});
