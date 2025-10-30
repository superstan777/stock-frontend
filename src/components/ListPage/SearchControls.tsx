"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "../ui/button";
import type { ColumnOption, EntityType } from "@/lib/types/table";
import { DatePicker } from "../ui/date-picker";
import { formatLocalDate } from "@/lib/utils";

export const SearchControls = <T extends EntityType>({
  pathname,
  columns,
}: {
  pathname: string;
  columns: ColumnOption<T>[];
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedFilter, setSelectedFilter] = useState<string>(
    columns[0]?.value || ""
  );
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    setInputValue("");
  }, [selectedFilter]);

  const selectedColumn = columns.find((col) => col.value === selectedFilter);

  const buildOrderedUrl = (params: URLSearchParams) => {
    const page = params.get("page");
    params.delete("page");

    const entries = Array.from(params.entries());
    const queryString =
      entries.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&") +
      (page ? `&page=${page}` : "");

    return `${pathname}?${queryString}`;
  };

  const handleSearch = () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) return;

    const params = new URLSearchParams(searchParams);

    const existing = params.get(selectedFilter);
    if (existing) {
      const existingValues = existing.split(",").map((v) => v.trim());
      if (!existingValues.includes(trimmedValue)) {
        params.set(selectedFilter, [...existingValues, trimmedValue].join(","));
      }
    } else {
      params.set(selectedFilter, trimmedValue);
    }

    params.set("page", "1");
    router.push(buildOrderedUrl(params));
    setInputValue("");
  };

  const handleClear = () => {
    const params = new URLSearchParams(searchParams);
    columns.forEach((col) => params.delete(col.value));
    params.set("page", "1");
    router.push(buildOrderedUrl(params));
  };

  const handleFilterChange = (value: string) => {
    setSelectedFilter(value);
    setInputValue("");
  };

  const hasSomethingToClear = useMemo(() => {
    return columns.some((col) => searchParams.get(col.value));
  }, [searchParams, columns]);

  return (
    <div className="flex gap-2 items-end">
      <Select value={selectedFilter} onValueChange={handleFilterChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select filter" />
        </SelectTrigger>
        <SelectContent>
          {columns.map((col) => (
            <SelectItem key={col.value} value={col.value}>
              {col.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedColumn?.type === "date" ? (
        <DatePicker
          label={selectedColumn.label}
          value={inputValue ? new Date(inputValue) : null}
          onChange={(val) => setInputValue(val ? formatLocalDate(val) : "")}
        />
      ) : (
        <Input
          type="text"
          placeholder="Search"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
      )}

      <Button onClick={handleSearch}>Search</Button>
      <Button
        variant="outline"
        onClick={handleClear}
        disabled={!hasSomethingToClear}
      >
        Clear
      </Button>
    </div>
  );
};
