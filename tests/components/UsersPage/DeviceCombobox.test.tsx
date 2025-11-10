import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { DeviceCombobox } from "@/components/UsersPage/DeviceCombobox";
import { useQuery } from "@tanstack/react-query";
import type { DeviceRow } from "@/lib/types/devices";

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
}));

jest.mock("@/lib/api/devices", () => ({
  getAllDevices: jest.fn(),
}));

jest.mock("@/components/ui/button", () => ({
  Button: jest.fn(
    (
      props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
        children: React.ReactNode;
      }
    ) => (
      <button data-testid="button" {...props}>
        <span data-testid="selected-label">{props.children}</span>
      </button>
    )
  ),
}));

jest.mock("@/components/ui/command", () => ({
  Command: jest.fn(({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  )),
  CommandEmpty: jest.fn(({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  )),
  CommandGroup: jest.fn(({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  )),
  CommandInput: jest.fn(
    (props: React.InputHTMLAttributes<HTMLInputElement>) => (
      <input data-testid="command-input" {...props} />
    )
  ),
  CommandItem: jest.fn(
    ({
      children,
      onSelect,
    }: {
      children: React.ReactNode;
      onSelect?: () => void;
    }) => (
      <div
        data-testid="command-item"
        onClick={onSelect}
        role="option"
        tabIndex={0}
      >
        {children}
      </div>
    )
  ),
  CommandList: jest.fn(({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  )),
}));

jest.mock("@/components/ui/popover", () => ({
  Popover: jest.fn(({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  )),
  PopoverTrigger: jest.fn(({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  )),
  PopoverContent: jest.fn(({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  )),
}));

describe("DeviceCombobox", () => {
  const mockUseQuery = useQuery as jest.Mock;

  const mockDevices: DeviceRow[] = [
    {
      id: "d1",
      model: "MacBook Pro",
      serial_number: "SN001",
      order_id: "ORD1",
      device_type: "computer",
      install_status: "deployed",
      created_at: "2025-10-01T00:00:00Z",
    },
    {
      id: "d2",
      model: "ThinkPad",
      serial_number: "SN002",
      order_id: "ORD2",
      device_type: "computer",
      install_status: "in_inventory",
      created_at: "2025-10-02T00:00:00Z",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state", () => {
    // loading -> data can be undefined
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    render(<DeviceCombobox value={null} onChange={jest.fn()} />);

    const button = screen.getByTestId("button");
    expect(within(button).getByText("Loading...")).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it("renders placeholder when not loading and no device selected", () => {
    // when data exists, it must be shaped as { data: DeviceRow[] }
    mockUseQuery.mockReturnValue({
      data: { data: mockDevices },
      isLoading: false,
      isError: false,
    });

    render(<DeviceCombobox value={null} onChange={jest.fn()} />);
    expect(screen.getByText("Select device...")).toBeInTheDocument();
  });

  it("renders selected device label", () => {
    mockUseQuery.mockReturnValue({
      data: { data: mockDevices },
      isLoading: false,
      isError: false,
    });

    render(<DeviceCombobox value="d2" onChange={jest.fn()} />);

    const label = screen.getByTestId("selected-label");
    expect(label).toHaveTextContent(/SN002/i);
  });

  it("calls onChange when device selected", () => {
    const onChange = jest.fn();
    mockUseQuery.mockReturnValue({
      data: { data: mockDevices },
      isLoading: false,
      isError: false,
    });

    render(<DeviceCombobox value={null} onChange={onChange} />);

    const items = screen.getAllByTestId("command-item");
    expect(items.length).toBeGreaterThan(0);
    fireEvent.click(items[0]);

    expect(onChange).toHaveBeenCalledWith("d1");
  });

  it("does not call onChange when disabled", () => {
    const onChange = jest.fn();
    mockUseQuery.mockReturnValue({
      data: { data: mockDevices },
      isLoading: false,
      isError: false,
    });

    render(<DeviceCombobox value={null} onChange={onChange} disabled />);

    const items = screen.getAllByTestId("command-item");
    fireEvent.click(items[0]);

    expect(onChange).not.toHaveBeenCalled();
  });

  it("renders 'No device found.' when list is empty", () => {
    mockUseQuery.mockReturnValue({
      data: { data: [] },
      isLoading: false,
      isError: false,
    });

    render(<DeviceCombobox value={null} onChange={jest.fn()} />);
    expect(screen.getByText("No device found.")).toBeInTheDocument();
  });
});
