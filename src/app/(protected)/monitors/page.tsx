"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import ListPage from "@/components/ListPage/ListPage";
import { getDevices, type DeviceFilter } from "@/lib/api/devices";
import { MONITOR_COLUMNS } from "@/lib/consts/monitors";

export default function MonitorsPage() {
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  const filters: DeviceFilter[] = [];
  searchParams.forEach((value, key) => {
    if (key !== "page" && value) {
      filters.push({ key, value });
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
      tableData={data?.devices}
      isLoading={isLoading}
      error={error}
      metaData={data?.meta}
    />
  );
}
