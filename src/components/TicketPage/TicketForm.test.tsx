import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TicketForm } from "./TicketForm";
import type { TicketWithUsers } from "@/lib/types/tickets";
import { Constants } from "@/lib/types/supabase";

jest.mock("../DevicesPage/UserCombobox", () => ({
  UserCombobox: ({ value, onChange }: any) => (
    <select
      data-testid="user-combobox"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Select user</option>
      <option value="123e4567-e89b-12d3-a456-426614174000">User A</option>
    </select>
  ),
}));

jest.mock("../ui/date-picker", () => ({
  DatePicker: ({ value, onChange, label }: any) => (
    <input
      data-testid={`date-picker-${label}`}
      type="date"
      value={value ? new Date(value).toISOString().split("T")[0] : ""}
      onChange={(e) => onChange(new Date(e.target.value))}
    />
  ),
}));

describe("TicketForm", () => {
  const mockOnSubmit = jest.fn();

  const mockTicket: TicketWithUsers = {
    id: "t1",
    title: "Printer error",
    description: "Printer not responding",
    number: 10,
    status: "new",
    created_at: "2025-10-25T12:00:00Z",
    assigned_to: {
      id: "123e4567-e89b-12d3-a456-426614174000",
      email: "tech@a.com",
    },
    caller: { id: "c1", email: "user@test.com" },
    estimated_resolution_date: "2025-10-30T00:00:00Z",
    resolution_date: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all form fields correctly", () => {
    render(<TicketForm ticket={mockTicket} onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText("Number")).toHaveValue("10");
    expect(screen.getByLabelText("Caller")).toHaveValue("user@test.com");

    expect(screen.getAllByRole("combobox")[0]).toBeInTheDocument();

    expect(screen.getByLabelText("Title")).toHaveValue("Printer error");
    expect(screen.getByLabelText("Description")).toHaveValue(
      "Printer not responding"
    );

    expect(screen.getByTestId("user-combobox")).toBeInTheDocument();
    expect(
      screen.getByTestId("date-picker-Estimated resolution date")
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("date-picker-Resolution date")
    ).toBeInTheDocument();
  });

  it("shows validation errors when required fields are empty", async () => {
    render(
      <TicketForm
        ticket={{ ...mockTicket, title: "", description: "", status: "" }}
        onSubmit={mockOnSubmit}
      />
    );

    const form = document.getElementById("ticket-form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("Title is required")).toBeInTheDocument();
      expect(screen.getByText("Description is required")).toBeInTheDocument();
      expect(screen.getByText("Status is required")).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("calls onSubmit with transformed ISO date values", async () => {
    render(<TicketForm ticket={mockTicket} onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Updated printer issue" },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "Still not printing" },
    });

    fireEvent.change(screen.getByTestId("user-combobox"), {
      target: { value: "123e4567-e89b-12d3-a456-426614174000" },
    });

    fireEvent.change(
      screen.getByTestId("date-picker-Estimated resolution date"),
      {
        target: { value: "2025-10-31" },
      }
    );

    const form = document.getElementById("ticket-form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Updated printer issue",
          description: "Still not printing",
          estimated_resolution_date: "2025-10-31T00:00:00.000Z",
          resolution_date: null,
          assigned_to: "123e4567-e89b-12d3-a456-426614174000",
          status: "new",
        })
      );
    });
  });

  it("handles null assigned_to correctly", async () => {
    render(
      <TicketForm
        ticket={{ ...mockTicket, assigned_to: null }}
        onSubmit={mockOnSubmit}
      />
    );

    const form = document.getElementById("ticket-form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ assigned_to: null })
      );
    });
  });

  it("handles null resolution_date correctly", async () => {
    render(
      <TicketForm
        ticket={{ ...mockTicket, resolution_date: null }}
        onSubmit={mockOnSubmit}
      />
    );

    const form = document.getElementById("ticket-form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ resolution_date: null })
      );
    });
  });

  it("renders select options from Constants", () => {
    render(<TicketForm ticket={mockTicket} onSubmit={mockOnSubmit} />);
    Constants.public.Enums.ticket_status.forEach((status) => {
      expect(screen.getByText(status)).toBeInTheDocument();
    });
  });
});
