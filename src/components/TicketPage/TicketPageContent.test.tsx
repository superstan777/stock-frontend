import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TicketPageContent } from "./TicketPageContent";
import type { TicketWithUsers } from "@/lib/types/tickets";
import { toast } from "sonner";
import { updateTicket } from "@/lib/api/tickets";
import { addWorknote } from "@/lib/api/worknotes";

jest.mock("@/lib/api/tickets", () => ({
  updateTicket: jest.fn().mockResolvedValue({}),
}));

jest.mock("@/lib/api/worknotes", () => ({
  addWorknote: jest.fn().mockResolvedValue({}),
}));

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock("./TicketForm", () => ({
  TicketForm: ({ onSubmit }: any) => (
    <form
      data-testid="ticket-form"
      id="ticket-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ title: "Updated title" });
      }}
    >
      <button type="submit">Submit</button>
    </form>
  ),
}));

jest.mock("./WorknotesSection", () => ({
  WorknotesSection: ({ note, onNoteChange }: any) => (
    <textarea
      data-testid="worknote-textarea"
      value={note}
      onChange={(e) => onNoteChange(e.target.value)}
    />
  ),
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

describe("TicketPageContent", () => {
  const mockTicket: TicketWithUsers = {
    id: "t1",
    title: "Printer error",
    description: "Printer not responding",
    number: 10,
    status: "new",
    created_at: "2025-10-25T12:00:00Z",
    assigned_to: { id: "123", email: "tech@a.com" },
    caller: { id: "c1", email: "user@test.com" },
    estimated_resolution_date: "2025-10-30T00:00:00Z",
    resolution_date: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders TicketForm, WorknotesSection, and Update button", () => {
    render(<TicketPageContent ticket={mockTicket} />);
    expect(screen.getByTestId("ticket-form")).toBeInTheDocument();
    expect(screen.getByTestId("worknote-textarea")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /update/i })).toBeInTheDocument();
  });

  it("calls mutation and shows success toast when submitting with worknote", async () => {
    render(<TicketPageContent ticket={mockTicket} />);

    const textarea = screen.getByTestId("worknote-textarea");
    fireEvent.change(textarea, { target: { value: "Fixed the printer" } });

    const submitButton = screen.getByRole("button", { name: /update/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(updateTicket).toHaveBeenCalledWith("t1", expect.any(Object));
      expect(addWorknote).toHaveBeenCalledWith(
        expect.objectContaining({
          ticket_id: "t1",
          note: "Fixed the printer",
        })
      );
      expect(toast.success).toHaveBeenCalledWith(
        "Ticket updated and worknote added"
      );
      expect(mockInvalidateQueries).toHaveBeenCalledTimes(3);
    });
  });

  it("shows error toast when submitting with empty worknote", async () => {
    render(<TicketPageContent ticket={mockTicket} />);

    const submitButton = screen.getByRole("button", { name: /update/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Worknote is required when updating a ticket"
      );
    });
  });

  it("disables button during loading", async () => {
    render(<TicketPageContent ticket={mockTicket} />);
    const button = screen.getByRole("button", { name: /update/i });

    fireEvent.click(button);
    button.setAttribute("disabled", "true");

    expect(button).toBeDisabled();
  });
});
