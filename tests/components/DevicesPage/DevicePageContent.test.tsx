import React from "react";
import { render, screen, act } from "@testing-library/react";
import { DevicePageContent } from "@/components/DevicesPage/DevicePageContent";
import { DeviceForm } from "@/components/DevicesPage/DeviceForm";
import { DeviceHistory } from "@/components/DevicesPage/DeviceHistory";

jest.mock("@/components/DevicesPage/DeviceForm", () => ({
  DeviceForm: jest.fn(() => <div data-testid="device-form" />),
}));

jest.mock("@/components/DevicesPage/DeviceHistory", () => ({
  DeviceHistory: jest.fn(() => <div data-testid="device-history" />),
}));

jest.mock("@/components/ui/button", () => ({
  Button: jest.fn(
    ({
      children,
      ...props
    }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
      children: React.ReactNode;
    }) => (
      <button data-testid="button" {...props}>
        {children}
      </button>
    )
  ),
}));

describe("DevicePageContent", () => {
  const mockDevice = {
    id: "dev1",
    model: "Test Device",
    created_at: "2025-10-15T12:00:00Z",
    device_type: "computer" as const,
    install_status: "End of Life" as const,
    order_id: "ORD123",
    serial_number: "SN123",
  };

  const mockRelations = [
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

  it("renders DeviceForm with correct props", () => {
    render(<DevicePageContent device={mockDevice} relations={mockRelations} />);
    const form = screen.getByTestId("device-form");
    expect(form).toBeInTheDocument();

    expect((DeviceForm as jest.Mock).mock.calls[0][0]).toEqual(
      expect.objectContaining({
        device: mockDevice,
        setIsLoading: expect.any(Function),
      })
    );
  });

  it("renders DeviceHistory with correct props", () => {
    render(<DevicePageContent device={mockDevice} relations={mockRelations} />);
    const history = screen.getByTestId("device-history");
    expect(history).toBeInTheDocument();

    expect((DeviceHistory as jest.Mock).mock.calls[0][0]).toEqual(
      expect.objectContaining({
        deviceId: mockDevice.id,
        relations: mockRelations,
        isLoading: false,
      })
    );
  });

  it("renders Update button when not loading", () => {
    render(<DevicePageContent device={mockDevice} relations={mockRelations} />);
    const button = screen.getByTestId("button");
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
    expect(button).toHaveTextContent("Update");

    const loader = screen.queryByTestId("loader");
    expect(loader).not.toBeInTheDocument();
  });

  it("renders loader inside button when isLoading is true", () => {
    let setIsLoadingFn: React.Dispatch<
      React.SetStateAction<boolean>
    > = () => {};
    (DeviceForm as jest.Mock).mockImplementation(({ setIsLoading }) => {
      setIsLoadingFn = setIsLoading;
      return <div data-testid="device-form" />;
    });

    render(<DevicePageContent device={mockDevice} relations={mockRelations} />);

    act(() => {
      setIsLoadingFn(true);
    });

    const loader = screen.getByTestId("loader");
    expect(loader).toBeInTheDocument();

    const buttons = screen.getAllByTestId("button");
    const button = buttons.find((btn) =>
      btn.querySelector('[data-testid="loader"]')
    );
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("Please wait");
  });
});
