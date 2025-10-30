import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "./LoginForm";
import { login } from "@/app/login/actions";

jest.mock("@/app/login/actions", () => ({
  login: jest.fn(),
}));

const mockReplace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({ replace: mockReplace })),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders email, password and submit button", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("calls login and shows error on failure", async () => {
    (login as jest.MockedFunction<typeof login>).mockResolvedValueOnce({
      error: "Invalid credentials",
    });

    render(<LoginForm />);
    await userEvent.type(screen.getByLabelText(/email/i), "alice@test.com");
    await userEvent.type(screen.getByLabelText(/password/i), "wrongpass");
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
    expect(login).toHaveBeenCalledWith(expect.any(FormData));
  });

  it("calls router.replace on successful login", async () => {
    (login as jest.MockedFunction<typeof login>).mockResolvedValueOnce({
      success: true,
    });

    render(<LoginForm />);
    await userEvent.type(screen.getByLabelText(/email/i), "alice@test.com");
    await userEvent.type(screen.getByLabelText(/password/i), "correctpass");
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/"));
  });

  it("disables submit button while submitting", async () => {
    let resolveLogin:
      | ((value: { error: string } | { success: boolean }) => void)
      | undefined;

    (login as jest.MockedFunction<typeof login>).mockImplementation(
      () =>
        new Promise<{ error: string } | { success: boolean }>((resolve) => {
          resolveLogin = resolve;
        })
    );

    render(<LoginForm />);
    await userEvent.type(screen.getByLabelText(/email/i), "alice@test.com");
    await userEvent.type(screen.getByLabelText(/password/i), "correctpass");

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /login/i }));
    });

    const button = await screen.findByRole("button", { name: /logging in/i });
    expect(button).toBeDisabled();

    await act(async () => {
      resolveLogin!({ success: true });
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /login/i })).not.toBeDisabled();
    });
  });
});
