"use client";

import { DataTable } from "@/components/ListPage/DataTable";
import { useQuery } from "@tanstack/react-query";
import { getTickets } from "@/lib/api/tickets";
import { TICKET_COLUMNS } from "@/lib/consts/tickets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const NewTicketsTable = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard", "new-tickets"],
    queryFn: () => getTickets([{ key: "status", value: "new" }]),
  });

  return (
    <Card>
      <CardHeader className="flex flex-col pb-6 border-b">
        <CardTitle>New Tickets</CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <DataTable
          data={data?.tickets ?? []}
          isLoading={isLoading}
          error={error}
          columns={TICKET_COLUMNS}
          entity="ticket"
        />
      </CardContent>
    </Card>
  );
};
