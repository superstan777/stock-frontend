import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { UserPageContent } from "@/components/UsersPage/UserPageContent";

jest.mock("@/components/UsersPage/UserForm", () => ({
  UserForm: jest.fn(({ user }) => (
    <form data-testid="user-form">
      <input name="name" defaultValue={user?.name ?? ""} />
      <input name="email" defaultValue={user?.email ?? ""} />
    </form>
  )),
}));

jest.mock("@/components/UsersPage/UserTabs", () => ({
  UserTabs: jest.fn(() => <div data-testid="user-tabs" />),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));

jest.mock("lucide-react", () => ({
  Loader2Icon: () => <svg data-testid="loader-icon" />,
}));

describe("UserPageContent", () => {
  const mockUser = {
    id: "u1",
    name: "Alice",
    email: "alice@test.com",
    created_at: "2025-10-01T00:00:00Z",
  };

  it("renders form, tabs and update button", () => {
    render(<UserPageContent user={mockUser} userId="u1" />);

    expect(screen.getByTestId("user-form")).toBeInTheDocument();
    expect(screen.getByTestId("user-tabs")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /update/i })).toBeInTheDocument();
  });

  it("button triggers form submission", () => {
    const onSubmitMock = jest.fn((e) => e.preventDefault());
    render(
      <form data-testid="user-form" onSubmit={onSubmitMock}>
        <input name="name" defaultValue={mockUser.name} />
        <button type="submit">Update</button>
      </form>
    );

    const button = screen.getByRole("button", { name: /update/i });
    fireEvent.click(button);

    expect(onSubmitMock).toHaveBeenCalled();
  });

  it("button shows spinner and is disabled when loading", () => {
    jest
      .spyOn(React, "useState")
      .mockImplementationOnce(() => [true, jest.fn()]);

    render(<UserPageContent user={mockUser} userId="u1" />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
    expect(button.textContent).toMatch(/Please wait/);
  });
});
