import React from "react";
import { render, screen } from "@testing-library/react";
import { DevicePage } from "./DevicePage";
import { DevicePageContent } from "./DevicePageContent";

import { useQuery } from "@tanstack/react-query";

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
}));

jest.mock("@/lib/api/devices", () => ({
  getDevice: jest.fn(),
}));

jest.mock("@/lib/api/relations", () => ({
  getRelationsByDevice: jest.fn(),
}));

jest.mock("./DevicePageContent", () => ({
  DevicePageContent: jest.fn(() => <div data-testid="device-content" />),
}));

jest.mock("../EntityNotFound", () => ({
  EntityNotFound: jest.fn(() => <div data-testid="entity-not-found" />),
}));

describe("DevicePage", () => {
  const mockUseQuery = useQuery as jest.Mock;

  const mockDevice = { id: "1", model: "Test Device" };
  const mockRelations = [{ id: "rel1", user: { name: "Alice" } }];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loader when device query is loading", () => {
    mockUseQuery.mockImplementation((args: any) => {
      if (args.queryKey[0] === "device") {
        return { data: null, isLoading: true, isError: false };
      }
      return { data: [], isLoading: false, isError: false };
    });

    render(<DevicePage id="1" />);
    const loader = screen.getByTestId("loader");
    expect(loader).toBeInTheDocument();
  });

  it("renders loader when relations query is loading", () => {
    mockUseQuery.mockImplementation((args: any) => {
      if (args.queryKey[0] === "deviceRelations") {
        return { data: null, isLoading: true, isError: false };
      }
      return { data: mockDevice, isLoading: false, isError: false };
    });

    render(<DevicePage id="1" />);
    const loader = screen.getByTestId("loader");
    expect(loader).toBeInTheDocument();
  });

  it("renders EntityNotFound on error or no device", () => {
    mockUseQuery.mockImplementation((args: any) => {
      if (args.queryKey[0] === "device") {
        return { data: null, isLoading: false, isError: true };
      }
      return { data: [], isLoading: false, isError: false };
    });

    render(<DevicePage id="1" />);
    expect(screen.getByTestId("entity-not-found")).toBeInTheDocument();
  });

  it("renders DevicePageContent with correct props", () => {
    mockUseQuery.mockImplementation((args: any) => {
      if (args.queryKey[0] === "device")
        return { data: mockDevice, isLoading: false, isError: false };
      if (args.queryKey[0] === "deviceRelations")
        return { data: mockRelations, isLoading: false, isError: false };
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
    mockUseQuery.mockImplementation((args: any) => {
      if (args.queryKey[0] === "device")
        return { data: mockDevice, isLoading: false, isError: false };
      if (args.queryKey[0] === "deviceRelations")
        return { data: undefined, isLoading: false, isError: false };
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
