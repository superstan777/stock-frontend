import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { UserCombobox } from "../../../src/components/DevicesPage/UserCombobox";
import { useQuery } from "@tanstack/react-query";
import type { UserRow } from "@/lib/types/users";

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
}));

jest.mock("@/lib/api/users", () => ({
  getUsers: jest.fn(),
}));

jest.mock("@/components/ui/button", () => ({
  Button: jest.fn(
    ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
      <button data-testid="button" {...props}>
        <span data-testid="selected-email">{children}</span>
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
      <div data-testid="command-item" onClick={onSelect}>
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

describe("UserCombobox", () => {
  const mockUseQuery = useQuery as jest.Mock;

  const mockUsers: UserRow[] = [
    {
      id: "u1",
      email: "alice@test.com",
      name: "Alice",
      created_at: "2025-01-01T00:00:00Z",
    },
    {
      id: "u2",
      email: "bob@test.com",
      name: "Bob",
      created_at: "2025-01-01T00:00:00Z",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state", () => {
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: true,
    });

    render(<UserCombobox value={null} onChange={jest.fn()} />);

    const button = screen.getByTestId("button");
    expect(within(button).getByText("Loading...")).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it("renders placeholder when not loading and no user selected", () => {
    mockUseQuery.mockReturnValue({
      data: mockUsers,
      isLoading: false,
    });

    render(<UserCombobox value={null} onChange={jest.fn()} />);
    expect(screen.getByText("Select user...")).toBeInTheDocument();
  });

  it("renders selected user email", () => {
    mockUseQuery.mockReturnValue({
      data: mockUsers,
      isLoading: false,
    });

    render(<UserCombobox value="u2" onChange={jest.fn()} />);

    const emailContainer = screen.getByTestId("selected-email");
    expect(
      within(emailContainer).getByText("bob@test.com")
    ).toBeInTheDocument();
  });

  it("calls onChange and closes when user is selected", () => {
    const onChange = jest.fn();
    mockUseQuery.mockReturnValue({
      data: mockUsers,
      isLoading: false,
    });

    render(<UserCombobox value={null} onChange={onChange} />);

    const items = screen.getAllByTestId("command-item");
    fireEvent.click(items[1]);

    expect(onChange).toHaveBeenCalledWith("u2");
  });

  it("does not call onChange when disabled", () => {
    const onChange = jest.fn();
    mockUseQuery.mockReturnValue({
      data: mockUsers,
      isLoading: false,
    });

    render(<UserCombobox value={null} onChange={onChange} disabled />);

    const items = screen.getAllByTestId("command-item");
    fireEvent.click(items[0]);

    expect(onChange).not.toHaveBeenCalled();
  });

  it("shows 'No user found.' when list is empty", () => {
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(<UserCombobox value={null} onChange={jest.fn()} />);
    expect(screen.getByText("No user found.")).toBeInTheDocument();
  });
});
