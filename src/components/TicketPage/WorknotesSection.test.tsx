import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { WorknotesSection } from "@/components/TicketPage/WorknotesSection";
import { useQuery } from "@tanstack/react-query";
import { getWorknotes } from "@/lib/api/worknotes";
import { Worknote } from "@/components/TicketPage/Worknote";

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
}));

jest.mock("@/lib/api/worknotes", () => ({
  getWorknotes: jest.fn(),
}));

jest.mock("@/components/TicketPage/Worknote", () => ({
  Worknote: jest.fn(() => <div data-testid="worknote" />),
}));

describe("WorknotesSection", () => {
  const mockUseQuery = useQuery as jest.Mock;
  const mockGetWorknotes = getWorknotes as jest.Mock;
  const mockOnNoteChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loader when query is loading", () => {
    mockUseQuery.mockImplementation(() => ({
      data: [],
      isLoading: true,
      isError: false,
    }));

    render(<WorknotesSection ticketId="t1" />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders error message when query fails", () => {
    mockUseQuery.mockImplementation(() => ({
      data: [],
      isLoading: false,
      isError: true,
    }));

    render(<WorknotesSection ticketId="t1" />);
    expect(screen.getByText("Error loading worknotes")).toBeInTheDocument();
  });

  it("renders empty state when there are no worknotes", () => {
    mockUseQuery.mockImplementation(() => ({
      data: [],
      isLoading: false,
      isError: false,
    }));

    render(<WorknotesSection ticketId="t1" />);
    expect(screen.getByText("No worknotes yet.")).toBeInTheDocument();
  });

  it("renders list of worknotes when data is available", () => {
    const mockWorknotes = [
      {
        id: "w1",
        note: "Investigating issue",
        created_at: "2025-10-28T10:00:00Z",
        author: { email: "test1@example.com" },
      },
      {
        id: "w2",
        note: "Fixed the issue",
        created_at: "2025-10-28T11:00:00Z",
        author: { email: "test2@example.com" },
      },
    ];

    // ✅ Symulujemy zachowanie React Query — czyli wywołanie queryFn()
    mockUseQuery.mockImplementation(({ queryFn, queryKey }) => {
      queryFn(); // wywołujemy mockowany getWorknotes(ticketId)
      return {
        data: mockWorknotes,
        isLoading: false,
        isError: false,
      };
    });

    render(<WorknotesSection ticketId="t1" />);

    expect(mockGetWorknotes).toHaveBeenCalledWith("t1");
    expect(screen.getAllByTestId("worknote")).toHaveLength(2);
  });

  it("calls onNoteChange when typing in textarea", () => {
    mockUseQuery.mockImplementation(() => ({
      data: [],
      isLoading: false,
      isError: false,
    }));

    render(
      <WorknotesSection ticketId="t1" note="" onNoteChange={mockOnNoteChange} />
    );

    const textarea = screen.getByPlaceholderText("Add a worknote");
    fireEvent.change(textarea, { target: { value: "new note text" } });

    expect(mockOnNoteChange).toHaveBeenCalledWith("new note text");
  });

  it("renders header and textarea always", () => {
    mockUseQuery.mockImplementation(() => ({
      data: [],
      isLoading: false,
      isError: false,
    }));

    render(<WorknotesSection ticketId="t1" note="test note" />);
    expect(screen.getByText("Worknotes")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Add a worknote")).toHaveValue(
      "test note"
    );
  });
});
