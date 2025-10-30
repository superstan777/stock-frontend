import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AddTicketForm } from "@/components/TicketPage/AddTicketForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock("@/lib/api/tickets", () => ({
  addTicket: jest.fn(),
}));

jest.mock("@/components/DevicesPage/UserCombobox", () => ({
  UserCombobox: jest.fn(({ value, onChange }) => (
    <select
      id="caller"
      data-testid="user-combobox"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Select user</option>
      <option value="123e4567-e89b-12d3-a456-426614174000">User A</option>
    </select>
  )),
}));

const mockInvalidateQueries = jest.fn();
(useQueryClient as jest.Mock).mockReturnValue({
  invalidateQueries: mockInvalidateQueries,
});

describe("AddTicketForm", () => {
  const mockMutate = jest.fn();
  const mockSetIsLoading = jest.fn();
  const mockOnSuccess = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isLoading: false,
    });
  });

  it("renders all form fields", () => {
    render(<AddTicketForm setIsLoading={mockSetIsLoading} />);
    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
    expect(screen.getByLabelText("Caller")).toBeInTheDocument();
    expect(screen.getByTestId("user-combobox")).toBeInTheDocument();
  });

  it("shows validation errors when submitting empty form", async () => {
    render(<AddTicketForm setIsLoading={mockSetIsLoading} />);
    const form = document.getElementById("ticket-form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("Title is required")).toBeInTheDocument();
      expect(screen.getByText("Description is required")).toBeInTheDocument();
      expect(screen.getByText("Invalid caller")).toBeInTheDocument();
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("calls addTicket mutation with correct data", async () => {
    render(<AddTicketForm setIsLoading={mockSetIsLoading} />);

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Network issue" },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "Cannot connect to WiFi" },
    });
    fireEvent.change(screen.getByTestId("user-combobox"), {
      target: { value: "123e4567-e89b-12d3-a456-426614174000" },
    });

    const form = document.getElementById("ticket-form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        title: "Network issue",
        description: "Cannot connect to WiFi",
        caller_id: "123e4567-e89b-12d3-a456-426614174000",
      });
    });
  });

  it("handles success correctly", async () => {
    (useMutation as jest.Mock).mockImplementation(({ onSuccess }) => ({
      mutate: () => {
        onSuccess?.();
      },
    }));

    render(
      <AddTicketForm
        setIsLoading={mockSetIsLoading}
        onSuccess={mockOnSuccess}
      />
    );

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Printer issue" },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "Printer not responding" },
    });
    fireEvent.change(screen.getByTestId("user-combobox"), {
      target: { value: "123e4567-e89b-12d3-a456-426614174000" },
    });

    const form = document.getElementById("ticket-form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Ticket has been created");
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["tickets"],
      });
    });
  });

  it("handles error correctly", async () => {
    (useMutation as jest.Mock).mockReturnValue({
      mutate: () => {
        const err = new Error("Failed");
        toast.error("Failed to create ticket");
        mockOnError(err);
      },
    });

    render(
      <AddTicketForm setIsLoading={mockSetIsLoading} onError={mockOnError} />
    );

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Broken link" },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "404 page not found" },
    });
    fireEvent.change(screen.getByTestId("user-combobox"), {
      target: { value: "123e4567-e89b-12d3-a456-426614174000" },
    });

    const form = document.getElementById("ticket-form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to create ticket");
      expect(mockOnError).toHaveBeenCalled();
    });
  });
});
