import { render, screen, fireEvent } from "@testing-library/react";
import { EntityNotFound } from "@/components/EntityNotFound";
import { useRouter, usePathname } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

describe("EntityNotFound", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it("renders correct entity name based on pathname", () => {
    (usePathname as jest.Mock).mockReturnValue("/tickets/123");
    render(<EntityNotFound />);
    expect(screen.getByText(/Ticket not found/i)).toBeInTheDocument();
  });

  it("navigates back to entity list when clicking button", () => {
    (usePathname as jest.Mock).mockReturnValue("/devices/42");
    render(<EntityNotFound />);
    fireEvent.click(screen.getByRole("button", { name: /go back/i }));
    expect(mockPush).toHaveBeenCalledWith("/devices");
  });
});
