"use client";

import { Input } from "@/components/ui/input";
import { FormField } from "../ui/form-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type {
  DeviceUpdate,
  DeviceInsert,
  DeviceRow,
  DeviceType,
  InstallStatus,
} from "@/lib/types/devices";
import { addDevice, updateDevice } from "@/lib/api/devices";
import { ALL_INSTALL_STATUSES, ALL_DEVICE_TYPES } from "@/lib/consts/devices";

const deviceSchema = z.object({
  serial_number: z.string().trim().min(1, "Serial number is required"),
  model: z.string().trim().min(1, "Model is required"),
  order_id: z.string().trim().min(1, "Order ID is required"),
  install_status: z.enum([
    "in_inventory",
    "disposed",
    "end_of_life",
    "deployed",
  ] as [InstallStatus, ...InstallStatus[]]),
  device_type: z.enum(["computer", "monitor"] as [DeviceType, ...DeviceType[]]),
});

type DeviceFormData = z.infer<typeof deviceSchema>;

export interface DeviceFormProps {
  device?: DeviceRow;
  deviceType?: DeviceType;
  setIsLoading: (loading: boolean) => void;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export const DeviceForm: React.FC<DeviceFormProps> = ({
  device,
  deviceType,
  setIsLoading,
  onSuccess,
  onError,
}) => {
  const queryClient = useQueryClient();
  const isEditMode = !!device;

  const { handleSubmit, control, register, formState } =
    useForm<DeviceFormData>({
      resolver: zodResolver(deviceSchema),
      defaultValues: {
        serial_number: device?.serial_number ?? "",
        model: device?.model ?? "",
        order_id: device?.order_id ?? "",
        install_status: device?.install_status ?? "in_inventory",
        device_type: device?.device_type ?? deviceType ?? "computer",
      },
    });

  const mutation = useMutation({
    mutationFn: async (data: DeviceFormData) => {
      if (isEditMode && device?.id) {
        return updateDevice(device.id, data as DeviceUpdate);
      }
      return addDevice(data as DeviceInsert);
    },
    onMutate: () => setIsLoading(true),
    onSettled: () => setIsLoading(false),
    onSuccess: () => {
      toast.success(
        device ? "Device has been updated" : "Device has been added"
      );
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(
        device
          ? "Failed to update device. Please try again."
          : "Failed to add device. Please try again."
      );
      onError?.(error);
    },
  });

  const onSubmit = (data: DeviceFormData) => mutation.mutate(data);

  return (
    <form
      role="form"
      id="device-form"
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-4"
    >
      <FormField
        id="serial_number"
        label="Serial number"
        error={formState.errors.serial_number?.message}
      >
        <Input
          id="serial_number"
          {...register("serial_number")}
          readOnly={isEditMode}
          className={isEditMode ? "bg-gray-50 cursor-not-allowed" : ""}
        />
      </FormField>

      <FormField
        id="model"
        label="Model"
        error={formState.errors.model?.message}
      >
        <Input id="model" {...register("model")} />
      </FormField>

      <FormField
        id="order_id"
        label="Order ID"
        error={formState.errors.order_id?.message}
      >
        <Input id="order_id" {...register("order_id")} />
      </FormField>

      <FormField
        id="install_status"
        label="Install status"
        error={formState.errors.install_status?.message}
      >
        <Controller
          control={control}
          name="install_status"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="install_status" className="w-full">
                <SelectValue placeholder="Select install status" />
              </SelectTrigger>
              <SelectContent>
                {ALL_INSTALL_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FormField>

      <FormField
        id="device_type"
        label="Device type"
        error={formState.errors.device_type?.message}
      >
        <Controller
          control={control}
          name="device_type"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange} disabled>
              <SelectTrigger id="device_type" className="w-full">
                <SelectValue placeholder="Device type" />
              </SelectTrigger>
              <SelectContent>
                {ALL_DEVICE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FormField>
    </form>
  );
};
