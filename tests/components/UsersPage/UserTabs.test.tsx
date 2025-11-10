import React from "react";
import { render, screen } from "@testing-library/react";
import { UserTabs } from "@/components/UsersPage/UserTabs";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { getRelationsByUser } from "@/lib/api/relations";
import { getTickets } from "@/lib/api/tickets";
import type { RelationWithDetails } from "@/lib/types/relations";
import type { TicketWithUsers } from "@/lib/types/tickets";

jest.mock("@/lib/api/relations", () => ({
  getRelationsByUser: jest.fn(() => Promise.resolve([{ id: "r1" }])),
}));
jest.mock("@/lib/api/tickets", () => ({
  getTickets: jest.fn(() =>
    Promise.resolve({
      data: [
        {
          id: "t1",
          number: 1,
          title: "Ticket 1",
          status: "new",
          description: null,
          created_at: "2025-01-01",
          resolution_date: null,
          estimated_resolution_date: null,
          caller: { id: "u1", email: "caller@test.com" },
          operator: { id: "o1", email: "operator@test.com" },
        } as TicketWithUsers,
      ],
    })
  ),
}));

jest.mock("@tanstack/react-query", () => {
  const original = jest.requireActual("@tanstack/react-query");
  return {
    ...original,
    useQueryClient: jest.fn(),
    useQuery: jest.fn(),
  };
});

jest.mock("@/components/UsersPage/RelationForm", () => ({
  RelationForm: () => <div data-testid="relation-form" />,
}));

jest.mock("@/components/ListPage/DataTable", () => ({
  DataTable: ({ data, isLoading, error, entity }: any) => (
    <div data-testid={`data-table-${entity}`}>
      {JSON.stringify({ data, isLoading, error })}
    </div>
  ),
}));

jest.mock("@/components/ui/tabs", () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  TabsTrigger: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => <button data-testid={`tab-${value}`}>{children}</button>,
  TabsContent: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => <div data-testid={`tab-content-${value}`}>{children}</div>,
}));

describe("UserTabs", () => {
  const mockQueryClient = { prefetchQuery: jest.fn() };
  const mockUseQuery = useQuery as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    (useQueryClient as jest.Mock).mockReturnValue(mockQueryClient);
  });

  it("prefetches and triggers query functions manually", async () => {
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<UserTabs userId="u1" />);

    expect(mockQueryClient.prefetchQuery).toHaveBeenCalledTimes(2);

    for (const call of mockQueryClient.prefetchQuery.mock.calls) {
      await call[0].queryFn();
    }

    for (const call of mockUseQuery.mock.calls) {
      if (call[0]?.queryFn) await call[0].queryFn();
    }

    expect(getRelationsByUser).toHaveBeenCalledWith("u1");
    expect(getTickets).toHaveBeenCalledWith([
      { key: "caller.id", value: "u1" },
    ]);
  });

  it("renders RelationForm and DataTables with correct props", () => {
    mockUseQuery.mockImplementation(({ queryKey }: { queryKey: string[] }) => {
      if (queryKey[0] === "userRelations")
        return {
          data: [{ id: "r1" }],
          isLoading: false,
          isError: false,
          error: null,
        };
      if (queryKey[0] === "userTickets")
        return {
          data: {
            data: [
              {
                id: "t1",
                number: 1,
                title: "Ticket 1",
                status: "new",
                description: null,
                created_at: "2025-01-01",
                resolution_date: null,
                estimated_resolution_date: null,
                caller: { id: "u1", email: "caller@test.com" },
                operator: { id: "o1", email: "operator@test.com" },
              } as TicketWithUsers,
            ],
          },
          isLoading: false,
          isError: false,
          error: null,
        };
      return { data: [], isLoading: false, isError: false, error: null };
    });

    render(<UserTabs userId="u1" />);

    expect(screen.getByTestId("relation-form")).toBeInTheDocument();
    expect(screen.getByTestId("data-table-relation")).toHaveTextContent('"r1"');
    expect(screen.getByTestId("data-table-ticket")).toHaveTextContent('"t1"');
  });

  it("handles loading and error states", () => {
    mockUseQuery.mockImplementation(({ queryKey }: { queryKey: string[] }) => {
      if (queryKey[0] === "userRelations")
        return { data: [], isLoading: true, isError: false, error: null };
      if (queryKey[0] === "userTickets")
        return {
          data: { data: [] },
          isLoading: false,
          isError: true,
          error: "Ticket error",
        };
      return { data: [], isLoading: false, isError: false, error: null };
    });

    render(<UserTabs userId="u1" />);

    expect(screen.getByTestId("data-table-relation")).toHaveTextContent(
      '"isLoading":true'
    );
    expect(screen.getByTestId("data-table-ticket")).toHaveTextContent(
      '"error":true'
    );
  });
});
