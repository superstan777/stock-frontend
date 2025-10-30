import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TicketPageContent } from "@/components/TicketPage/TicketPageContent";
import type { TicketWithUsers, TicketUpdate } from "@/lib/types/tickets";
import { toast } from "sonner";
import { updateTicket } from "@/lib/api/tickets";
import { addWorknote } from "@/lib/api/worknotes";
import React from "react";

jest.mock("@/lib/api/tickets", () => ({
  updateTicket: jest.fn().mockResolvedValue({}),
}));

jest.mock("@/lib/api/worknotes", () => ({
  addWorknote: jest.fn().mockResolvedValue({}),
}));

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

interface MockTicketFormProps {
  onSubmit: (data: TicketUpdate) => void;
}

interface MockWorknotesSectionProps {
  note: string;
  onNoteChange: (value: string) => void;
}

jest.mock("@/components/TicketPage/TicketForm", () => ({
  TicketForm: ({ onSubmit }: MockTicketFormProps) => (
    <form
      data-testid="ticket-form"
      id="ticket-form"
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit({ title: "Updated title" } as unknown as TicketUpdate);
      }}
    >
      <button type="submit">Submit</button>
    </form>
  ),
}));

jest.mock("@/components/TicketPage/WorknotesSection", () => ({
  WorknotesSection: ({ note, onNoteChange }: MockWorknotesSectionProps) => (
    <textarea
      data-testid="worknote-textarea"
      value={note}
      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
        onNoteChange(e.target.value)
      }
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
    useMutation: <TData, TVariables>({
      mutationFn,
      onSuccess,
      onError,
      onSettled,
    }: {
      mutationFn: (data: TVariables) => Promise<TData>;
      onSuccess?: () => void;
      onError?: (error: Error) => void;
      onSettled?: () => void;
    }) => ({
      mutate: async (data: TVariables) => {
        try {
          await mutationFn(data);
          onSuccess?.();
        } catch (err) {
          onError?.(err as Error);
        } finally {
          onSettled?.();
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
