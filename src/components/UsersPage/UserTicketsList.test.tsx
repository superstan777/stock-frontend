import React from "react";
import { render, screen } from "@testing-library/react";
import { UserTicketsList } from "./UserTicketsList";
import { DataTable } from "../ListPage/DataTable";
import { USER_TICKETS_COLUMNS } from "@/lib/consts/tickets";
import type { TicketRow } from "@/lib/types/tickets";

jest.mock("../ListPage/DataTable", () => ({
  DataTable: jest.fn(() => (
    <div data-testid="data-table">DataTable rendered</div>
  )),
}));

jest.mock("@/lib/consts/tickets", () => ({
  USER_TICKETS_COLUMNS: [{ id: "id", header: "ID" }],
}));

describe("UserTicketsList", () => {
  const mockTickets: TicketRow[] = [
    {
      id: "t1",
      number: 123,
      title: "Test Ticket",
      description: "Test desc",
      status: "open",
      assigned_to: null,
      caller_id: null,
      created_at: "2024-01-01",
      estimated_resolution_date: null,
      resolution_date: null,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state", () => {
    render(
      <UserTicketsList
        userId="u1"
        tickets={[]}
        isLoading={true}
        isError={false}
        error={null}
      />
    );

    expect(screen.getByText("Loading tickets...")).toBeInTheDocument();
    expect(screen.queryByTestId("data-table")).not.toBeInTheDocument();
  });

  it("renders error state", () => {
    render(
      <UserTicketsList
        userId="u1"
        tickets={[]}
        isLoading={false}
        isError={true}
        error={"Network error"}
      />
    );

    expect(screen.getByText("Error loading tickets.")).toBeInTheDocument();
    expect(screen.queryByTestId("data-table")).not.toBeInTheDocument();
  });

  it("renders DataTable with correct props when not loading or error", () => {
    render(
      <UserTicketsList
        userId="u1"
        tickets={mockTickets}
        isLoading={false}
        isError={false}
        error={null}
      />
    );

    expect(screen.getByTestId("data-table")).toBeInTheDocument();

    expect(DataTable).toHaveBeenCalledWith(
      expect.objectContaining({
        data: mockTickets,
        columns: USER_TICKETS_COLUMNS,
        isLoading: false,
        error: null,
        entity: "ticket",
      }),
      undefined
    );
  });
});
