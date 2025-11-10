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
import { getUsers } from "@/lib/api/users";
import type { UserRow } from "@/lib/types/users";

interface UserComboboxProps {
  value: string | null; // UUID użytkownika
  onChange: (value: string | null) => void;
  disabled?: boolean; // nowy props
}

export function UserCombobox({
  value,
  onChange,
  disabled = false,
}: UserComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["users", "all"],
    queryFn: () => getUsers(),
  });
  const users: UserRow[] = data?.data ?? [];

  const selectedUser = users.find((u) => u.id === value) ?? null;

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
          ) : selectedUser ? (
            selectedUser.email
          ) : (
            "Select user..."
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
            placeholder="Search by email..."
            className="h-9"
            disabled={disabled || isLoading}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Loading..." : "No user found."}
            </CommandEmpty>
            <CommandGroup>
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.email}
                  onSelect={() => {
                    if (!disabled) {
                      onChange(user.id);
                      setOpen(false);
                    }
                  }}
                >
                  <span>{user.email}</span>
                  <Check
                    className={cn(
                      "ml-auto",
                      value === user.id ? "opacity-100" : "opacity-0"
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
