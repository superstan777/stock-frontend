import React from "react";
import { render, screen } from "@testing-library/react";
import ListPage from "./ListPage";
import { DataTable } from "./DataTable";
import { ListHeader } from "./ListHeader";
import { PaginationControls } from "./PaginationControls";
import type { ColumnOption, EntityData } from "@/lib/types/table";

jest.mock("./DataTable", () => ({
  DataTable: jest.fn(() => <div data-testid="data-table" />),
}));

jest.mock("./ListHeader", () => ({
  ListHeader: jest.fn(() => <div data-testid="list-header" />),
}));

jest.mock("./PaginationControls", () => ({
  PaginationControls: jest.fn(() => <div data-testid="pagination-controls" />),
}));

describe("ListPage", () => {
  const mockColumns: ColumnOption<"user">[] = [
    { label: "Name", value: "name" },
    { label: "Email", value: "email" },
  ];

  const mockData: EntityData<"user">[] = [
    {
      id: "u1",
      name: "Alice",
      email: "alice@test.com",
      created_at: "2025-10-15T12:00:00Z",
    },
    {
      id: "u2",
      name: "Bob",
      email: "bob@test.com",
      created_at: "2025-10-16T12:00:00Z",
    },
  ];

  const mockPages = { current: 1, total: 3 };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders ListHeader, DataTable, and PaginationControls", () => {
    render(
      <ListPage
        entity="user"
        columns={mockColumns}
        tableData={mockData}
        pages={mockPages}
        isLoading={false}
        error={null}
      />
    );

    expect(screen.getByTestId("list-header")).toBeInTheDocument();
    expect(screen.getByTestId("data-table")).toBeInTheDocument();
    expect(screen.getByTestId("pagination-controls")).toBeInTheDocument();
  });

  it("passes correct props to DataTable", () => {
    render(
      <ListPage
        entity="user"
        columns={mockColumns}
        tableData={mockData}
        pages={mockPages}
        isLoading={false}
        error={null}
      />
    );

    const props = (DataTable as jest.Mock).mock.calls[0][0];
    expect(props).toEqual(
      expect.objectContaining({
        data: mockData,
        isLoading: false,
        error: null,
        columns: mockColumns,
        entity: "user",
      })
    );
  });

  it("passes correct props to PaginationControls", () => {
    render(
      <ListPage
        entity="user"
        columns={mockColumns}
        tableData={mockData}
        pages={mockPages}
        isLoading={false}
        error={null}
      />
    );

    const props = (PaginationControls as jest.Mock).mock.calls[0][0];
    expect(props).toEqual(
      expect.objectContaining({
        currentPage: mockPages.current,
        totalPages: mockPages.total,
      })
    );
  });

  it("passes correct props to ListHeader", () => {
    render(
      <ListPage
        entity="user"
        columns={mockColumns}
        tableData={mockData}
        pages={mockPages}
        isLoading={false}
        error={null}
      />
    );

    const props = (ListHeader as jest.Mock).mock.calls[0][0];
    expect(props).toEqual(
      expect.objectContaining({
        entity: "user",
        columns: mockColumns,
      })
    );
  });
});
