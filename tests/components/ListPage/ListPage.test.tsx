import React from "react";
import { render, screen } from "@testing-library/react";
import ListPage from "@/components/ListPage/ListPage";
import { DataTable } from "@/components/ListPage/DataTable";
import { ListHeader } from "@/components/ListPage/ListHeader";
import { PaginationControls } from "@/components/ListPage/PaginationControls";
import type { ColumnOption, EntityData } from "@/lib/types/table";

jest.mock("@/components/ListPage/DataTable", () => ({
  DataTable: jest.fn(() => <div data-testid="data-table" />),
}));

jest.mock("@/components/ListPage/ListHeader", () => ({
  ListHeader: jest.fn(() => <div data-testid="list-header" />),
}));

jest.mock("@/components/ListPage/PaginationControls", () => ({
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

  // const mockPages = { currentPage: 1, totalPages: 3 };
  const mockMetaData = { count: 5, current_page: 1, total_pages: 3 };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders ListHeader, DataTable, and PaginationControls", () => {
    render(
      <ListPage
        entity="user"
        columns={mockColumns}
        tableData={mockData}
        metaData={mockMetaData}
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
        metaData={mockMetaData}
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
        metaData={mockMetaData}
        isLoading={false}
        error={null}
      />
    );

    const props = (PaginationControls as jest.Mock).mock.calls[0][0];
    expect(props).toEqual(
      expect.objectContaining({
        currentPage: mockMetaData.current_page,
        totalPages: mockMetaData.total_pages,
      })
    );
  });

  it("passes correct props to ListHeader", () => {
    render(
      <ListPage
        entity="user"
        columns={mockColumns}
        tableData={mockData}
        metaData={mockMetaData}
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
