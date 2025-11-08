"use client";

import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { addTicket } from "@/lib/api/tickets";
import { UserCombobox } from "../DevicesPage/UserCombobox";

const ticketSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().min(1, "Description is required"),
  caller_id: z.uuid("Invalid caller"),
});

type TicketFormData = z.infer<typeof ticketSchema>;

export interface AddTicketFormProps {
  setIsLoading: (loading: boolean) => void;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export const AddTicketForm: React.FC<AddTicketFormProps> = ({
  setIsLoading,
  onSuccess,
  onError,
}) => {
  const queryClient = useQueryClient();

  const {
    handleSubmit,
    control,
    register,
    formState: { errors },
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: TicketFormData) => addTicket(data),
    onMutate: () => setIsLoading(true),
    onSettled: () => setIsLoading(false),
    onSuccess: () => {
      toast.success("Ticket has been created");
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Failed to create ticket");
      onError?.(error);
    },
  });

  const onSubmit = (data: TicketFormData) => {
    mutation.mutate(data);
  };

  return (
    <form
      id="ticket-form"
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-4"
    >
      <FormField id="title" label="Title" error={errors.title?.message}>
        <Input id="title" {...register("title")} />
      </FormField>

      <FormField
        id="description"
        label="Description"
        error={errors.description?.message}
      >
        <Input id="description" {...register("description")} />
      </FormField>

      <FormField id="caller" label="Caller" error={errors.caller_id?.message}>
        <Controller
          control={control}
          name="caller_id"
          render={({ field }) => (
            <UserCombobox
              value={field.value ?? null}
              onChange={field.onChange}
            />
          )}
        />
      </FormField>
    </form>
  );
};
