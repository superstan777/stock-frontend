"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import ListPage from "@/components/ListPage/ListPage";
import { getTickets } from "@/lib/api/tickets";
import { TICKET_COLUMNS } from "@/lib/consts/tickets";
import type { TicketFilter, TicketFilterKeyType } from "@/lib/types/tickets";

export default function TicketsPage() {
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  const filters: TicketFilter[] = [];

  searchParams.forEach((value, key) => {
    if (!["page"].includes(key) && value) {
      filters.push({ key: key as TicketFilterKeyType, value });
    }
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["tickets", currentPage, filters],
    queryFn: () => getTickets(filters, currentPage),
  });

  return (
    <ListPage
      entity="ticket"
      columns={TICKET_COLUMNS}
      tableData={data?.data}
      isLoading={isLoading}
      error={error}
      metaData={data?.meta}
    />
  );
}
