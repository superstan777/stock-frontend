import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { FormDialog } from "./FormDialog";
import { DeviceForm } from "../DevicesPage/DeviceForm";
import { UserForm } from "../UsersPage/UserForm";
import { AddTicketForm } from "../TicketPage/AddTicketForm";

jest.mock("../DevicesPage/DeviceForm", () => ({
  DeviceForm: jest.fn(() => <div data-testid="device-form" />),
}));

jest.mock("../UsersPage/UserForm", () => ({
  UserForm: jest.fn(() => <div data-testid="user-form" />),
}));

jest.mock("../TicketPage/AddTicketForm", () => ({
  AddTicketForm: jest.fn(() => <div data-testid="ticket-form" />),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

describe("FormDialog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders DeviceForm when entity is computer", () => {
    render(<FormDialog entity="computer" open={true} />);
    expect(screen.getByTestId("device-form")).toBeInTheDocument();
  });

  it("renders DeviceForm when entity is monitor", () => {
    render(<FormDialog entity="monitor" open={true} />);
    expect(screen.getByTestId("device-form")).toBeInTheDocument();
  });

  it("renders UserForm when entity is user", () => {
    render(<FormDialog entity="user" open={true} />);
    expect(screen.getByTestId("user-form")).toBeInTheDocument();
  });

  it("renders AddTicketForm when entity is ticket", () => {
    render(<FormDialog entity="ticket" open={true} />);
    expect(screen.getByTestId("ticket-form")).toBeInTheDocument();
  });

  it("displays loading state on submit button", () => {
    let setIsLoadingFn: React.Dispatch<
      React.SetStateAction<boolean>
    > = () => {};

    (DeviceForm as jest.Mock).mockImplementation(({ setIsLoading }) => {
      setIsLoadingFn = setIsLoading;
      return <div data-testid="device-form" />;
    });

    render(<FormDialog entity="computer" open={true} />);

    act(() => {
      setIsLoadingFn(true);
    });

    const button = screen.getByRole("button", { name: /please wait/i });
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("Please wait");
  });

  it("displays error message when handleError is called", () => {
    let handleErrorFn: ((error: unknown) => void) | undefined;

    (DeviceForm as jest.Mock).mockImplementation(({ onError }) => {
      handleErrorFn = onError;
      return <div data-testid="device-form" />;
    });

    render(<FormDialog entity="computer" open={true} />);

    act(() => {
      handleErrorFn?.({ code: "23505" });
    });

    expect(
      screen.getByText("computer already in database")
    ).toBeInTheDocument();
  });

  it("renders cancel button and submit button with correct text", () => {
    render(<FormDialog entity="computer" open={true} />);
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create computer/i })
    ).toBeInTheDocument();
  });
});
