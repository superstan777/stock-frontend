import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchControls } from "./SearchControls";
import type { ColumnOption } from "@/lib/types/table";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

import { useSearchParams } from "next/navigation";

describe("SearchControls", () => {
  const columns: ColumnOption<"user">[] = [
    { label: "Name", value: "name" },
    { label: "Email", value: "email" },
    { label: "Created At", value: "created_at", type: "date" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders Select and buttons", () => {
    render(<SearchControls pathname="/users" columns={columns} />);

    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search")).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeInTheDocument();
    expect(screen.getByText("Clear")).toBeInTheDocument();
  });

  it("updates selected filter when selecting another option", () => {
    render(<SearchControls pathname="/users" columns={columns} />);

    const selectTrigger = screen.getByText("Name");
    fireEvent.click(selectTrigger);

    const emailOption = screen.getByText("Email");
    fireEvent.click(emailOption);

    expect(screen.getByPlaceholderText("Search")).toBeInTheDocument();
  });

  it("calls router.push with new param when Enter pressed in input", () => {
    render(<SearchControls pathname="/users" columns={columns} />);
    const input = screen.getByPlaceholderText("Search");

    fireEvent.change(input, { target: { value: "Alice" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(pushMock).toHaveBeenCalledWith("/users?name=Alice&page=1");
    expect(input).toHaveValue("");
  });

  it("calls router.push with new param when Search button clicked", () => {
    render(<SearchControls pathname="/users" columns={columns} />);
    const input = screen.getByPlaceholderText("Search");
    const searchButton = screen.getByText("Search");

    fireEvent.change(input, { target: { value: "Bob" } });
    fireEvent.click(searchButton);

    expect(pushMock).toHaveBeenCalledWith("/users?name=Bob&page=1");
    expect(input).toHaveValue("");
  });

  it("calls router.push and clears filters when Clear button clicked", () => {
    (useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams("name=Alice&email=bob@test.com")
    );

    render(<SearchControls pathname="/users" columns={columns} />);
    const clearButton = screen.getByText("Clear");

    fireEvent.click(clearButton);

    expect(pushMock).toHaveBeenCalledWith("/users?&page=1");
  });

  it("disables Clear button if no filter values", () => {
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());

    render(<SearchControls pathname="/users" columns={columns} />);
    const clearButton = screen.getByText("Clear") as HTMLButtonElement;

    expect(clearButton.disabled).toBe(true);
  });
});
