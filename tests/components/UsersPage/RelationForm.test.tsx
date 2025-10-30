import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RelationForm } from "@/components/UsersPage/RelationForm";
import { toast } from "sonner";
import { createRelation, hasActiveRelation } from "@/lib/api/relations";

// ✅ Mock API
jest.mock("@/lib/api/relations", () => ({
  createRelation: jest.fn(),
  hasActiveRelation: jest.fn(),
}));

// ✅ Mock Query Client
const mockInvalidateQueries = jest.fn();
jest.mock("@tanstack/react-query", () => {
  const actual = jest.requireActual("@tanstack/react-query");

  interface MockMutationOptions<TData, TError, TVariables> {
    mutationFn: (variables: TVariables) => Promise<TData> | TData;
    onSuccess?: (data: TData) => void;
    onError?: (error: TError) => void;
  }

  return {
    ...actual,
    useQueryClient: () => ({
      invalidateQueries: mockInvalidateQueries,
    }),
    useMutation: <TData, TError, TVariables>(
      opts: MockMutationOptions<TData, TError, TVariables>
    ) => ({
      mutate: (data: TVariables) => {
        Promise.resolve(opts.mutationFn(data))
          .then((res) => opts.onSuccess?.(res))
          .catch((err) => opts.onError?.(err));
      },
      isPending: false,
    }),
  };
});

// ✅ Mock toastów
jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

// ✅ Mock comboboxów i date pickera
jest.mock("@/components/DevicesPage/UserCombobox", () => ({
  UserCombobox: ({
    value,
    onChange,
    disabled,
  }: {
    value: string | null;
    onChange: (value: string) => void;
    disabled?: boolean;
  }) => (
    <select
      data-testid="user-combobox"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    >
      <option value="">Select user</option>
      <option value="user1">User One</option>
    </select>
  ),
}));

jest.mock("@/components/UsersPage/DeviceCombobox", () => ({
  DeviceCombobox: ({
    value,
    onChange,
    disabled,
  }: {
    value: string | null;
    onChange: (value: string) => void;
    disabled?: boolean;
  }) => (
    <select
      data-testid="device-combobox"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    >
      <option value="">Select device</option>
      <option value="device1">Device One</option>
    </select>
  ),
}));

jest.mock("@/components/ui/date-picker", () => ({
  DatePicker: ({
    value,
    onChange,
  }: {
    value: Date | null;
    onChange: (value: Date) => void;
  }) => (
    <input
      data-testid="date-picker"
      type="date"
      value={value ? value.toISOString().split("T")[0] : ""}
      onChange={(e) => onChange(new Date(e.target.value))}
    />
  ),
}));

describe("RelationForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all fields when no defaults provided", () => {
    render(<RelationForm />);

    expect(screen.getByTestId("user-combobox")).toBeInTheDocument();
    expect(screen.getByTestId("device-combobox")).toBeInTheDocument();
    expect(screen.getByTestId("date-picker")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /assign/i })).toBeDisabled();
  });

  it("disables user or device combobox when default IDs are provided", () => {
    render(<RelationForm defaultUserId="user1" defaultDeviceId="device1" />);

    expect(screen.queryByTestId("user-combobox")).not.toBeInTheDocument();
    expect(screen.queryByTestId("device-combobox")).not.toBeInTheDocument();
  });

  it("shows error toast if device already has active relation", async () => {
    (hasActiveRelation as jest.Mock).mockResolvedValue(true);

    render(<RelationForm />);
    fireEvent.change(screen.getByTestId("user-combobox"), {
      target: { value: "user1" },
    });
    fireEvent.change(screen.getByTestId("device-combobox"), {
      target: { value: "device1" },
    });
    fireEvent.change(screen.getByTestId("date-picker"), {
      target: { value: "2025-11-01" },
    });

    const button = screen.getByRole("button", { name: /assign/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(hasActiveRelation).toHaveBeenCalledWith("device1");
      expect(toast.error).toHaveBeenCalledWith(
        "This device already has an active relation"
      );
    });
  });

  it("calls createRelation and shows success toast", async () => {
    (hasActiveRelation as jest.Mock).mockResolvedValue(false);
    (createRelation as jest.Mock).mockResolvedValue({});

    render(<RelationForm />);
    fireEvent.change(screen.getByTestId("user-combobox"), {
      target: { value: "user1" },
    });
    fireEvent.change(screen.getByTestId("device-combobox"), {
      target: { value: "device1" },
    });
    fireEvent.change(screen.getByTestId("date-picker"), {
      target: { value: "2025-11-02" },
    });

    const button = screen.getByRole("button", { name: /assign/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(createRelation).toHaveBeenCalledWith({
        user_id: "user1",
        device_id: "device1",
        start_date: "2025-11-02",
      });
      expect(toast.success).toHaveBeenCalledWith("Relation has been created");
      expect(mockInvalidateQueries).toHaveBeenCalled();
    });
  });

  it("shows error toast if API call fails", async () => {
    (hasActiveRelation as jest.Mock).mockResolvedValue(false);
    (createRelation as jest.Mock).mockRejectedValue(new Error("Failed"));

    render(<RelationForm />);
    fireEvent.change(screen.getByTestId("user-combobox"), {
      target: { value: "user1" },
    });
    fireEvent.change(screen.getByTestId("device-combobox"), {
      target: { value: "device1" },
    });
    fireEvent.change(screen.getByTestId("date-picker"), {
      target: { value: "2025-11-03" },
    });

    const button = screen.getByRole("button", { name: /assign/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to create relation");
    });
  });

  it("shows error toast if hasActiveRelation throws error", async () => {
    (hasActiveRelation as jest.Mock).mockRejectedValue(
      new Error("Network error")
    );

    render(<RelationForm />);
    fireEvent.change(screen.getByTestId("user-combobox"), {
      target: { value: "user1" },
    });
    fireEvent.change(screen.getByTestId("device-combobox"), {
      target: { value: "device1" },
    });
    fireEvent.change(screen.getByTestId("date-picker"), {
      target: { value: "2025-11-04" },
    });

    const button = screen.getByRole("button", { name: /assign/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Error verifying relation status"
      );
    });
  });
});
