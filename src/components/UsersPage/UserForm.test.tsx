import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { UserForm, UserFormProps } from "./UserForm";
import { addUser, updateUser } from "@/lib/api/users";
import { toast } from "sonner";

jest.mock("@/lib/api/users", () => ({
  addUser: jest.fn().mockResolvedValue({}),
  updateUser: jest.fn().mockResolvedValue({}),
}));

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const mockInvalidateQueries = jest.fn();
jest.mock("@tanstack/react-query", () => {
  const original = jest.requireActual("@tanstack/react-query");
  return {
    ...original,
    useQueryClient: () => ({
      invalidateQueries: mockInvalidateQueries,
    }),
    useMutation: (opts: any) => ({
      mutate: async (data: any) => {
        try {
          await opts.mutationFn(data);
          opts.onSuccess?.();
        } catch (error) {
          opts.onError?.(error);
        } finally {
          opts.onSettled?.();
        }
      },
    }),
  };
});

describe("UserForm", () => {
  const mockSetIsLoading = jest.fn();
  const mockOnSuccess = jest.fn();
  const mockOnError = jest.fn();

  const defaultProps: UserFormProps = {
    setIsLoading: mockSetIsLoading,
    onSuccess: mockOnSuccess,
    onError: mockOnError,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders name and email fields", () => {
    render(<UserForm {...defaultProps} />);
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("shows validation errors for empty name and invalid email", async () => {
    render(<UserForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "invalid-email" },
    });

    const formElement = screen.getByTestId("user-form");

    const submitButton = document.createElement("button");
    submitButton.type = "submit";
    formElement.appendChild(submitButton);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Name is required")).toBeInTheDocument();
      expect(screen.getByText("Invalid email")).toBeInTheDocument();
    });
  });

  it("calls addUser mutation when no user prop is passed", async () => {
    render(<UserForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Alice" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "alice@test.com" },
    });

    const submitButton = document.createElement("button");
    submitButton.type = "submit";
    screen.getByTestId("user-form").appendChild(submitButton);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(addUser).toHaveBeenCalledWith({
        name: "Alice",
        email: "alice@test.com",
      });
      expect(toast.success).toHaveBeenCalledWith("User has been added");
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["users"],
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it("calls updateUser mutation when user prop is passed", async () => {
    const mockUser = {
      id: "u1",
      name: "Bob",
      email: "bob@test.com",
      created_at: "2025-10-01T00:00:00Z",
    };
    render(<UserForm {...defaultProps} user={mockUser} />);

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Robert" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "robert@test.com" },
    });

    const submitButton = document.createElement("button");
    submitButton.type = "submit";
    screen.getByTestId("user-form").appendChild(submitButton);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(updateUser).toHaveBeenCalledWith(mockUser.id, {
        name: "Robert",
        email: "robert@test.com",
      });
      expect(toast.success).toHaveBeenCalledWith("User has been updated");
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["users"],
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it("calls onError when mutation fails", async () => {
    (addUser as jest.Mock).mockRejectedValueOnce(new Error("Failed to add"));

    render(<UserForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Alice" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "alice@test.com" },
    });

    const submitButton = document.createElement("button");
    submitButton.type = "submit";
    screen.getByTestId("user-form").appendChild(submitButton);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Failed to add user. Please try again."
      );
      expect(mockOnError).toHaveBeenCalled();
    });
  });
});
