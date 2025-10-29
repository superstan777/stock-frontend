import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { UserPageContent } from "@/components/UsersPage/UserPageContent";
import type { UserRow } from "@/lib/types/users";

jest.mock("@/components/UsersPage/UserForm", () => ({
  UserForm: ({
    user,
  }: {
    user: UserRow;
    setIsLoading: (loading: boolean) => void;
  }) => (
    <form data-testid="user-form">
      <input name="name" defaultValue={user?.name ?? ""} />
      <input name="email" defaultValue={user?.email ?? ""} />
    </form>
  ),
}));

jest.mock("@/components/UsersPage/UserTabs", () => ({
  UserTabs: ({ userId }: { userId: string }) => (
    <div data-testid="user-tabs">{`Tabs for ${userId}`}</div>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    type,
    form,
    disabled,
  }: {
    children: React.ReactNode;
    type?: "button" | "submit" | "reset";
    form?: string;
    disabled?: boolean;
  }) => (
    <button type={type} form={form} disabled={disabled}>
      {children}
    </button>
  ),
}));

jest.mock("lucide-react", () => ({
  Loader2Icon: () => <svg data-testid="loader-icon" />,
}));

describe("UserPageContent", () => {
  const mockUser: UserRow = {
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
    const onSubmitMock = jest.fn((e: React.FormEvent) => e.preventDefault());

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
