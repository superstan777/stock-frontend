import React from "react";
import { render, screen } from "@testing-library/react";
import { UserDevicesList } from "@/components/UsersPage/UserDevicesList";
import { DataTable } from "@/components/ListPage/DataTable";
import type { RelationWithDetails } from "@/lib/types/relations";

// 🔧 Mock DataTable (żeby nie testować jego wnętrza)
jest.mock("@/components/ListPage/DataTable", () => ({
  DataTable: jest.fn(() => <div data-testid="data-table" />),
}));

describe("UserDevicesList", () => {
  const mockRelations: RelationWithDetails[] = [
    {
      id: "rel1",
      start_date: "2025-10-01T00:00:00Z",
      end_date: null,
      device: {
        id: "d1",
        model: "MacBook Pro",
        serial_number: "SN001",
        order_id: "ORD1",
        device_type: "computer",
        install_status: "Deployed",
        created_at: "2025-10-01T00:00:00Z",
      },
      user: {
        id: "u1",
        name: "Alice",
        email: "alice@test.com",
        created_at: "2025-10-01T00:00:00Z",
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state", () => {
    render(
      <UserDevicesList
        userId="u1"
        relations={[]}
        isLoading={true}
        isError={false}
        error={null}
      />
    );

    expect(screen.getByText("Loading devices...")).toBeInTheDocument();
    expect(screen.queryByTestId("data-table")).not.toBeInTheDocument();
  });

  it("renders error state", () => {
    render(
      <UserDevicesList
        userId="u1"
        relations={[]}
        isLoading={false}
        isError={true}
        error={new Error("Failed")}
      />
    );

    expect(screen.getByText("Error loading devices.")).toBeInTheDocument();
    expect(screen.queryByTestId("data-table")).not.toBeInTheDocument();
  });

  it("renders DataTable with correct props when loaded", () => {
    render(
      <UserDevicesList
        userId="u1"
        relations={mockRelations}
        isLoading={false}
        isError={false}
        error={null}
      />
    );

    expect(screen.getByTestId("data-table")).toBeInTheDocument();

    // Sprawdzamy, że DataTable dostał odpowiednie propsy
    const calledProps = (DataTable as jest.Mock).mock.calls[0][0];
    expect(calledProps).toMatchObject({
      data: mockRelations,
      isLoading: false,
      entity: "relation",
    });
    expect(calledProps.error).toBe(null);
  });

  it("renders even with empty relations array", () => {
    render(
      <UserDevicesList
        userId="u1"
        relations={[]}
        isLoading={false}
        isError={false}
        error={null}
      />
    );

    expect(screen.getByTestId("data-table")).toBeInTheDocument();
    const calledProps = (DataTable as jest.Mock).mock.calls[0][0];
    expect(calledProps.data).toEqual([]);
  });
});
