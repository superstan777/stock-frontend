import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { EndRelationDialog } from "./EndRelationDialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

jest.mock("@/lib/api/relations", () => ({
  endRelation: jest.fn(),
}));

jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({
    children,
  }: React.PropsWithChildren<{
    open?: boolean;
    onOpenChange?: (val: boolean) => void;
  }>) => <div>{children}</div>,
  DialogTrigger: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
  DialogContent: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
  DialogHeader: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  DialogDescription: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
  DialogFooter: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
  DialogClose: ({
    children,
  }: React.PropsWithChildren<{ asChild?: boolean }>) => <div>{children}</div>,
}));

describe("EndRelationDialog", () => {
  const mockInvalidateQueries = jest.fn();
  const mockMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useQueryClient as jest.Mock).mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    });

    (useMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  it("renders End button", () => {
    render(<EndRelationDialog relationId="r1" />);
    expect(screen.getByText("End")).toBeInTheDocument();
  });

  it("calls mutate when Confirm is clicked and shows success toast", () => {
    render(<EndRelationDialog relationId="r1" userId="u1" deviceId="d1" />);

    const confirmButton = screen.getByText("Confirm");
    fireEvent.click(confirmButton);

    expect(mockMutate).toHaveBeenCalled();
  });

  it("invalidates queries and shows success toast on mutation success", () => {
    let onSuccess: () => void = () => {};
    (useMutation as jest.Mock).mockImplementation(
      ({ onSuccess: os }: { onSuccess?: () => void }) => {
        onSuccess = os ?? (() => {});
        return { mutate: jest.fn(), isPending: false };
      }
    );

    render(<EndRelationDialog relationId="r1" userId="u1" deviceId="d1" />);
    onSuccess();

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ["userRelations", "u1"],
    });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ["deviceRelations", "d1"],
    });
    expect(toast.success).toHaveBeenCalledWith("Relation ended");
  });

  it("shows error toast on mutation error", () => {
    let onError: () => void = () => {};
    (useMutation as jest.Mock).mockImplementation(
      ({ onError: oe }: { onError?: () => void }) => {
        onError = oe ?? (() => {});
        return { mutate: jest.fn(), isPending: false };
      }
    );

    render(<EndRelationDialog relationId="r1" />);
    onError();

    expect(toast.error).toHaveBeenCalledWith("Failed to end relation");
  });

  it("disables Confirm and Cancel buttons when isPending is true", () => {
    (useMutation as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isPending: true,
    });

    render(<EndRelationDialog relationId="r1" />);

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    expect(cancelButton).toBeDisabled();

    const confirmButton = screen.getByRole("button", { name: /ending/i });
    expect(confirmButton).toBeDisabled();
  });
});
