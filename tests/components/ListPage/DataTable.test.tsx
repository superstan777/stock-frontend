import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { DataTable } from "@/components/ListPage/DataTable";
import type { RelationWithDetails } from "@/lib/types/relations";
import type { ColumnOption } from "@/lib/types/table";
import { useRouter } from "next/navigation";

// --- MOCKI ---
jest.mock("@/components/EndRelationDialog", () => ({
  EndRelationDialog: jest.fn(() => <div data-testid="end-relation-dialog" />),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: React.ComponentProps<"button">) => (
    <button data-testid="button" {...props}>
      {children}
    </button>
  ),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// --- TESTY ---
describe("DataTable", () => {
  const mockPush = jest.fn();
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

  const columns: ColumnOption<"relation">[] = [
    {
      label: "User",
      value: "user.email",
      route: "users",
      routeIdPath: "user.id",
    },
    { label: "Start Date", value: "start_date", type: "date" },
    { label: "End Date", value: "end_date", type: "date" },
    { label: "Actions", value: "actions", type: "actions" },
  ];

  const mockDevice = {
    id: "dev1",
    model: "Elitebook",
    created_at: "2025-10-15T12:00:00Z",
    device_type: "computer" as const,
    install_status: "End of Life" as const,
    order_id: "ORD123",
    serial_number: "SN123",
  };

  const mockRelations: RelationWithDetails[] = [
    {
      id: "rel1",
      start_date: "2025-10-01T00:00:00Z",
      end_date: null,
      device: mockDevice,
      user: {
        id: "user1",
        name: "Alice",
        email: "alice@test.com",
        created_at: "2025-09-11T08:05:27Z",
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it("renders table headers and data", () => {
    render(
      <DataTable
        data={mockRelations}
        isLoading={false}
        error={undefined}
        columns={columns}
        entity="relation"
      />
    );

    // Sprawdź nagłówki
    columns.forEach((col) => {
      expect(screen.getByText(col.label)).toBeInTheDocument();
    });

    // Sprawdź dane
    expect(screen.getByText("alice@test.com")).toBeInTheDocument();
    expect(screen.getByTestId("end-relation-dialog")).toBeInTheDocument();
  });

  it("renders skeletons when loading", () => {
    render(
      <DataTable
        data={undefined}
        isLoading={true}
        error={undefined}
        columns={columns}
        entity="relation"
      />
    );

    const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders error state", () => {
    const mockError = new Error("Failed");

    render(
      <DataTable
        data={[]}
        isLoading={false}
        error={mockError}
        columns={columns}
        entity="relation"
      />
    );

    const alertTitle = document.querySelector('[data-slot="alert-title"]');
    expect(alertTitle).toHaveTextContent("Failed to load data");

    const alertDescription = document.querySelector(
      '[data-slot="alert-description"]'
    );
    expect(alertDescription).toHaveTextContent(mockError.message);

    expect(screen.getByText("Try Again")).toBeInTheDocument();
  });

  it("renders empty state when no data", () => {
    render(
      <DataTable
        data={[]}
        isLoading={false}
        error={undefined}
        columns={columns}
        entity="relation"
      />
    );

    expect(screen.getByText("No relations found")).toBeInTheDocument();
  });

  it("calls router.push when clicking a cell with route", () => {
    render(
      <DataTable
        data={mockRelations}
        isLoading={false}
        error={undefined}
        columns={columns}
        entity="relation"
      />
    );

    const userButton = screen.getByText("alice@test.com");
    fireEvent.click(userButton);

    expect(mockPush).toHaveBeenCalledWith("/users/user1");
  });

  it("renders EndRelationDialog for actions column", () => {
    render(
      <DataTable
        data={mockRelations}
        isLoading={false}
        error={undefined}
        columns={columns}
        entity="relation"
      />
    );

    expect(screen.getByTestId("end-relation-dialog")).toBeInTheDocument();
  });
});
