import React from "react";
import { render, screen } from "@testing-library/react";
import { DataTable } from "@/components/ListPage/DataTable";
import { DEVICE_PAGE_RELATION_COLUMNS } from "@/lib/consts/relations";
import type { RelationWithDetails } from "@/lib/types/relations";
import { DeviceHistory } from "@/components/DevicesPage/DeviceHistory";

jest.mock("@/components/ListPage/DataTable", () => ({
  DataTable: jest.fn(() => <div data-testid="data-table" />),
}));

jest.mock("@/components/UsersPage/RelationForm", () => ({
  RelationForm: jest.fn(() => <div data-testid="relation-form" />),
}));

describe("DeviceHistory", () => {
  const mockRelations: RelationWithDetails[] = [
    {
      id: "b5fd4710-25ae-491d-be2d-864cfa15fe71",
      start_date: "2025-10-18T00:00:00+00:00",
      end_date: "2025-10-19T07:42:17.103+00:00",
      device: {
        id: "9cc00f25-8b36-415e-8ab4-ffeeef0b2b16",
        model: "Elitebook 840 g10",
        order_id: "ORD112",
        created_at: "2025-10-15T23:57:50",
        device_type: "computer",
        serial_number: "SER1",
        install_status: "End of Life",
      },
      user: {
        id: "84c3c658-f2a5-46e2-b269-b9aee98c0ba0",
        name: "Alice Johnson",
        email: "alice.johnson@stock.pl",
        created_at: "2025-09-11T08:05:27.687402+00:00",
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function getDataTableProps() {
    expect(DataTable).toHaveBeenCalled();
    // Zwracamy pierwszy argument, ignorujemy context
    return (DataTable as jest.Mock).mock.calls[0][0];
  }

  it("renders RelationForm and DataTable", () => {
    render(
      <DeviceHistory
        deviceId="device-123"
        relations={mockRelations}
        isLoading={false}
      />
    );

    expect(screen.getByTestId("relation-form")).toBeInTheDocument();
    expect(screen.getByTestId("data-table")).toBeInTheDocument();
  });

  it("renders DataTable with correct props", () => {
    render(
      <DeviceHistory
        deviceId="device-123"
        relations={mockRelations}
        isLoading={false}
      />
    );

    const props = getDataTableProps();
    expect(props).toEqual(
      expect.objectContaining({
        data: mockRelations,
        isLoading: false,
        error: undefined,
        columns: DEVICE_PAGE_RELATION_COLUMNS,
        entity: "relation",
      })
    );
  });

  it("renders loading state", () => {
    render(
      <DeviceHistory deviceId="device-123" relations={[]} isLoading={true} />
    );

    const props = getDataTableProps();
    expect(props.isLoading).toBe(true);
  });

  it("renders error state", () => {
    const mockError = new Error("Failed");

    render(
      <DeviceHistory
        deviceId="device-123"
        relations={[]}
        isLoading={false}
        error={mockError}
      />
    );

    const props = getDataTableProps();
    expect(props.error).toBe(mockError);
  });
});
