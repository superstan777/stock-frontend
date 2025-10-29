import { render, screen } from "@testing-library/react";
import { Worknote } from "@/components/TicketPage/Worknote";

describe("Worknote", () => {
  const mockDate = "2025-10-28T14:30:00Z";

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date("2025-10-28T14:30:00Z"));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("renders author email, formatted date, and note", () => {
    render(
      <Worknote
        authorEmail="tech@example.com"
        note="Printer has been fixed."
        createdAt={mockDate}
      />
    );

    expect(screen.getByText("tech@example.com")).toBeInTheDocument();
    expect(screen.getByText(/Printer has been fixed./)).toBeInTheDocument();

    const formattedDate = new Date(mockDate).toLocaleString();
    expect(screen.getByText(formattedDate)).toBeInTheDocument();
  });

  it("renders correctly without authorEmail", () => {
    render(<Worknote note="Note without author" createdAt={mockDate} />);

    expect(screen.getByText("Note without author")).toBeInTheDocument();

    const maybeAuthor = screen.queryByText(/@/);
    expect(maybeAuthor).toBeNull();
  });

  it("formats the date properly using toLocaleString", () => {
    const testDate = "2023-05-01T10:00:00Z";
    render(
      <Worknote
        authorEmail="admin@test.com"
        note="Checking date formatting"
        createdAt={testDate}
      />
    );

    const formattedDate = new Date(testDate).toLocaleString();
    expect(screen.getByText(formattedDate)).toBeInTheDocument();
  });

  it("applies correct styling classes", () => {
    const { container } = render(
      <Worknote
        authorEmail="user@test.com"
        note="Styled note"
        createdAt={mockDate}
      />
    );

    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass(
      "border",
      "rounded-xl",
      "p-3",
      "mb-2",
      "bg-white",
      "shadow-sm"
    );
  });
});
