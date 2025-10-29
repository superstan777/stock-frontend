import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DeviceCombobox } from "@/components/UsersPage/DeviceCombobox";
import { useQuery } from "@tanstack/react-query";
import type { DeviceRow } from "@/lib/types/devices";
import * as api from "@/lib/api/devices";

jest.mock("@/lib/api/devices");
jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    role,
    "aria-expanded": ariaExpanded,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    role?: string;
    "aria-expanded"?: boolean;
  }) => (
    <button
      data-testid="combobox-button"
      onClick={onClick}
      disabled={disabled}
      role={role}
      aria-expanded={ariaExpanded}
    >
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/popover", () => ({
  Popover: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popover">{children}</div>
  ),
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  PopoverContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popover-content">{children}</div>
  ),
}));

jest.mock("@/components/ui/command", () => ({
  Command: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  CommandInput: ({
    placeholder,
    disabled,
  }: {
    placeholder?: string;
    disabled?: boolean;
  }) => (
    <input
      data-testid="command-input"
      placeholder={placeholder}
      disabled={disabled}
    />
  ),
  CommandEmpty: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="command-empty">{children}</div>
  ),
  CommandGroup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="command-group">{children}</div>
  ),
  CommandList: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="command-list">{children}</div>
  ),
  CommandItem: ({
    children,
    onSelect,
    selected = false,
  }: {
    children: React.ReactNode;
    onSelect?: () => void;
    selected?: boolean;
  }) => (
    <div
      data-testid="command-item"
      onClick={onSelect}
      role="option"
      tabIndex={0}
      aria-selected={selected}
    >
      {children}
    </div>
  ),
}));

describe("DeviceCombobox", () => {
  const mockUseQuery = useQuery as jest.Mock;
  const mockOnChange = jest.fn();

  const mockDevices: DeviceRow[] = [
    {
      id: "d1",
      model: "MacBook Pro",
      serial_number: "SN001",
      order_id: "ORD1",
      device_type: "computer",
      install_status: "Deployed",
      created_at: "2025-10-01T00:00:00Z",
    },
    {
      id: "d2",
      model: "ThinkPad",
      serial_number: "SN002",
      order_id: "ORD2",
      device_type: "computer",
      install_status: "In Inventory",
      created_at: "2025-10-02T00:00:00Z",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (api.getAllDevices as jest.Mock).mockImplementation(jest.fn());
  });

  it("renders loading state", () => {
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: true,
    });

    render(<DeviceCombobox value={null} onChange={mockOnChange} />);
    const loadingTexts = screen.getAllByText("Loading...");
    expect(loadingTexts.length).toBeGreaterThan(0);
  });

  it("renders 'Select device...' when no value", () => {
    mockUseQuery.mockReturnValue({
      data: mockDevices,
      isLoading: false,
    });

    render(<DeviceCombobox value={null} onChange={mockOnChange} />);
    expect(screen.getByText("Select device...")).toBeInTheDocument();
  });

  it("renders selected device label", () => {
    mockUseQuery.mockReturnValue({
      data: mockDevices,
      isLoading: false,
    });

    render(<DeviceCombobox value="d1" onChange={mockOnChange} />);
    expect(screen.getByText(/COMPUTER • SN001/i)).toBeInTheDocument();
  });

  it("renders 'No device found' when empty and not loading", () => {
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(<DeviceCombobox value={null} onChange={mockOnChange} />);
    expect(screen.getByText("No device found.")).toBeInTheDocument();
  });

  it("calls onChange when device selected", async () => {
    mockUseQuery.mockReturnValue({
      data: mockDevices,
      isLoading: false,
    });

    render(<DeviceCombobox value={null} onChange={mockOnChange} />);
    const deviceItem = screen.getAllByTestId("command-item")[0];
    fireEvent.click(deviceItem);

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith("d1");
    });
  });

  it("does not call onChange when disabled", async () => {
    mockUseQuery.mockReturnValue({
      data: mockDevices,
      isLoading: false,
    });

    render(<DeviceCombobox value={null} onChange={mockOnChange} disabled />);
    const deviceItem = screen.getAllByTestId("command-item")[0];
    fireEvent.click(deviceItem);

    await waitFor(() => {
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  it("disables button and input when loading or disabled", () => {
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: true,
    });

    render(<DeviceCombobox value={null} onChange={mockOnChange} disabled />);
    const button = screen.getByTestId("combobox-button");
    const input = screen.getByTestId("command-input");

    expect(button).toBeDisabled();
    expect(input).toBeDisabled();
  });
});
