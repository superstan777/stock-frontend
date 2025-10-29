"use client";

import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { addUser } from "@/lib/api/users";
import { updateUser } from "@/lib/api/users";

import type { UserRow, UserUpdate } from "@/lib/types/users";

const userSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.email("Invalid email"),
});

type UserFormData = z.infer<typeof userSchema>;

export interface UserFormProps {
  user?: UserRow;
  setIsLoading: (loading: boolean) => void;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export const UserForm: React.FC<UserFormProps> = ({
  user,
  setIsLoading,
  onSuccess,
  onError,
}) => {
  const queryClient = useQueryClient();

  const { handleSubmit, register, formState } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: UserFormData) => {
      if (user) {
        return updateUser(user.id, data as UserUpdate);
      }
      return addUser(data);
    },
    onMutate: () => setIsLoading(true),
    onSettled: () => setIsLoading(false),
    onSuccess: () => {
      toast.success(user ? "User has been updated" : "User has been added");
      queryClient.invalidateQueries({ queryKey: ["users"] });

      onSuccess?.();
    },
    onError: (error) => {
      toast.error(
        user
          ? "Failed to update user. Please try again."
          : "Failed to add user. Please try again."
      );
      onError?.(error);
    },
  });

  const onSubmit = (data: UserFormData) => mutation.mutate(data);

  return (
    <form
      id="user-form"
      data-testid="user-form"
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-4"
    >
      <FormField id="name" label="Name" error={formState.errors.name?.message}>
        <Input id="name" {...register("name")} />
      </FormField>

      <FormField
        id="email"
        label="Email"
        error={formState.errors.email?.message}
      >
        <Input id="email" {...register("email")} />
      </FormField>
    </form>
  );
};
