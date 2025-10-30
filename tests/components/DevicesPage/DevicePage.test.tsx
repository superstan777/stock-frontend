import React from "react";
import { render, screen } from "@testing-library/react";
import { DevicePage } from "@/components/DevicesPage/DevicePage";
import { DevicePageContent } from "@/components/DevicesPage/DevicePageContent";
import { useQuery } from "@tanstack/react-query";
import type { DeviceRow } from "@/lib/types/devices";
import type { RelationWithDetails } from "@/lib/types/relations";

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
}));

jest.mock("@/lib/api/devices", () => ({
  getDevice: jest.fn(),
}));

jest.mock("@/lib/api/relations", () => ({
  getRelationsByDevice: jest.fn(),
}));

jest.mock("@/components/DevicesPage/DevicePageContent", () => ({
  DevicePageContent: jest.fn(() => <div data-testid="device-content" />),
}));

jest.mock("@/components/EntityNotFound", () => ({
  EntityNotFound: jest.fn(() => <div data-testid="entity-not-found" />),
}));

describe("DevicePage", () => {
  const mockUseQuery = useQuery as jest.Mock;

  const mockDevice: DeviceRow = {
    id: "1",
    model: "Test Device",
    created_at: "2025-10-15T12:00:00Z",
    device_type: "computer",
    install_status: "End of Life",
    order_id: "ORD123",
    serial_number: "SN123",
  };

  const mockRelations: RelationWithDetails[] = [
    {
      id: "rel1",
      start_date: "2025-10-01T00:00:00Z",
      end_date: "2025-10-02T00:00:00Z",
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
  });

  it("renders loader when device query is loading", () => {
    mockUseQuery.mockImplementation(({ queryKey }: { queryKey: unknown[] }) => {
      if (queryKey[0] === "device") {
        return { data: null, isLoading: true, isError: false };
      }
      return { data: [], isLoading: false, isError: false };
    });

    render(<DevicePage id="1" />);
    expect(screen.getByTestId("loader")).toBeInTheDocument();
  });

  it("renders loader when relations query is loading", () => {
    mockUseQuery.mockImplementation(({ queryKey }: { queryKey: unknown[] }) => {
      if (queryKey[0] === "deviceRelations") {
        return { data: null, isLoading: true, isError: false };
      }
      return { data: mockDevice, isLoading: false, isError: false };
    });

    render(<DevicePage id="1" />);
    expect(screen.getByTestId("loader")).toBeInTheDocument();
  });

  it("renders EntityNotFound on error or no device", () => {
    mockUseQuery.mockImplementation(({ queryKey }: { queryKey: unknown[] }) => {
      if (queryKey[0] === "device") {
        return { data: null, isLoading: false, isError: true };
      }
      return { data: [], isLoading: false, isError: false };
    });

    render(<DevicePage id="1" />);
    expect(screen.getByTestId("entity-not-found")).toBeInTheDocument();
  });

  it("renders DevicePageContent with correct props", () => {
    mockUseQuery.mockImplementation(({ queryKey }: { queryKey: unknown[] }) => {
      if (queryKey[0] === "device") {
        return { data: mockDevice, isLoading: false, isError: false };
      }
      if (queryKey[0] === "deviceRelations") {
        return { data: mockRelations, isLoading: false, isError: false };
      }
      return { data: null, isLoading: false, isError: false };
    });

    render(<DevicePage id="1" />);
    expect(screen.getByTestId("device-content")).toBeInTheDocument();

    const calledProps = (DevicePageContent as jest.Mock).mock.calls[0][0];
    expect(calledProps).toEqual({
      device: mockDevice,
      relations: mockRelations,
    });
  });

  it("renders empty relations if relationsQuery.data is undefined", () => {
    mockUseQuery.mockImplementation(({ queryKey }: { queryKey: unknown[] }) => {
      if (queryKey[0] === "device") {
        return { data: mockDevice, isLoading: false, isError: false };
      }
      if (queryKey[0] === "deviceRelations") {
        return { data: undefined, isLoading: false, isError: false };
      }
      return { data: null, isLoading: false, isError: false };
    });

    render(<DevicePage id="1" />);
    const calledProps = (DevicePageContent as jest.Mock).mock.calls[0][0];
    expect(calledProps).toEqual({
      device: mockDevice,
      relations: [],
    });
  });
});
