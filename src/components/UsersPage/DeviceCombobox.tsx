"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2Icon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getAllDevices } from "@/lib/api/devices";
import type { DeviceRow } from "@/lib/types/devices";

interface DeviceComboboxProps {
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
}

export function DeviceCombobox({
  value,
  onChange,
  disabled = false,
}: DeviceComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["devices", "all"],
    queryFn: getAllDevices,
  });

  const devices: DeviceRow[] = data?.devices ?? [];

  const selectedDevice = devices.find((d) => d.id === value) ?? null;

  return (
    <Popover open={open} onOpenChange={(val) => !disabled && setOpen(val)}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled || isLoading}
        >
          {isLoading ? (
            <span className="flex items-center">
              <Loader2Icon className="animate-spin mr-2 h-4 w-4" /> Loading...
            </span>
          ) : isError ? (
            "Error loading devices"
          ) : selectedDevice ? (
            `${selectedDevice.device_type.toUpperCase()} • ${
              selectedDevice.serial_number
            } (${selectedDevice.model})`
          ) : (
            "Select device..."
          )}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="p-0"
        style={{ width: triggerRef.current?.offsetWidth ?? 260 }}
      >
        <Command>
          <CommandInput
            placeholder="Search by serial or model..."
            className="h-9"
            disabled={disabled || isLoading}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading
                ? "Loading..."
                : isError
                ? "Error fetching devices"
                : "No device found."}
            </CommandEmpty>
            <CommandGroup>
              {devices.map((device) => (
                <CommandItem
                  key={device.id}
                  value={device.id}
                  onSelect={() => {
                    if (!disabled) {
                      onChange(device.id);
                      setOpen(false);
                    }
                  }}
                >
                  <span>{`${device.device_type.toUpperCase()} • ${
                    device.serial_number
                  } (${device.model})`}</span>
                  <Check
                    className={cn(
                      "ml-auto",
                      value === device.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
