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
    (login as jest.Mock).mockResolvedValueOnce({
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
    (login as jest.Mock).mockResolvedValueOnce({ error: null });

    render(<LoginForm />);
    await userEvent.type(screen.getByLabelText(/email/i), "alice@test.com");
    await userEvent.type(screen.getByLabelText(/password/i), "correctpass");
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/"));
  });

  it("disables submit button while submitting", async () => {
    let resolveLogin: (value: any) => void;
    (login as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveLogin = resolve;
        })
    );

    render(<LoginForm />);
    await userEvent.type(screen.getByLabelText(/email/i), "alice@test.com");
    await userEvent.type(screen.getByLabelText(/password/i), "correctpass");

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /login/i }));
    });

    // submit button should show "Logging in..." and be disabled
    const button = await screen.findByRole("button", { name: /logging in/i });
    expect(button).toBeDisabled();

    // resolve login
    await act(async () => resolveLogin({ error: null }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /login/i })).not.toBeDisabled();
    });
  });
});
