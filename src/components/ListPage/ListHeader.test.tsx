import React from "react";
import { render, screen } from "@testing-library/react";
import { ListHeader } from "./ListHeader";

jest.mock("./FormDialog", () => ({
  FormDialog: jest.fn(() => <div data-testid="form-dialog" />),
}));

jest.mock("./SearchControls", () => ({
  SearchControls: jest.fn(() => <div data-testid="search-controls" />),
}));

jest.mock("./ActiveFilters", () => ({
  ActiveFilters: jest.fn(() => <div data-testid="active-filters" />),
}));

jest.mock("../ui/button", () => ({
  Button: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

import { usePathname } from "next/navigation";

describe("ListHeader", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders title correctly for / path", () => {
    (usePathname as jest.Mock).mockReturnValue("/");
    render(<ListHeader entity="user" columns={[]} />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("renders title correctly for other paths", () => {
    (usePathname as jest.Mock).mockReturnValue("/computers");
    render(<ListHeader entity="computer" columns={[]} />);
    expect(screen.getByText("Computers")).toBeInTheDocument();
  });

  it("renders FormDialog with trigger", () => {
    (usePathname as jest.Mock).mockReturnValue("/users");
    render(<ListHeader entity="user" columns={[]} />);

    const dialog = screen.getByTestId("form-dialog");
    expect(dialog).toBeInTheDocument();
  });

  it("renders SearchControls and ActiveFilters", () => {
    (usePathname as jest.Mock).mockReturnValue("/users");
    render(<ListHeader entity="user" columns={[]} />);

    expect(screen.getByTestId("search-controls")).toBeInTheDocument();
    expect(screen.getByTestId("active-filters")).toBeInTheDocument();
  });
});
