"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import ListPage from "@/components/ListPage/ListPage";
import { getDevices } from "@/lib/api/devices";
import { MONITOR_COLUMNS } from "@/lib/consts/monitors";
import type { MonitorFilter, MonitorFilterKeyType } from "@/lib/types/devices";

export default function MonitorsPage() {
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  const filters: MonitorFilter[] = [];
  searchParams.forEach((value, key) => {
    if (key !== "page" && value) {
      filters.push({ key: key as MonitorFilterKeyType, value });
    }
  });
  const { data, isLoading, error } = useQuery({
    queryKey: ["devices", "monitors", currentPage, filters],
    queryFn: () => getDevices("monitor", filters, currentPage),
  });

  return (
    <ListPage
      entity="monitor"
      columns={MONITOR_COLUMNS}
      tableData={data?.data}
      isLoading={isLoading}
      error={error}
      metaData={data?.meta}
    />
  );
}
