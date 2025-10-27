"use client";

import { useQuery } from "@tanstack/react-query";
import { getOpenTicketsStats } from "@/lib/api/tickets";
import { ChartBarDefault } from "../ui/chart-bar-default";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ErrorComponent } from "../ErrorComponent";
import { EmptyComponent } from "../EmptyComponent";

export const TicketsByDayChart = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    data = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["dashboard", "open-tickets-stats"],
    queryFn: getOpenTicketsStats,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <Card
        className="flex justify-center items-center h-48"
        data-testid="loader"
      >
        <Loader2 className="animate-spin text-muted-foreground" />
      </Card>
    );
  }

  if (isError) return <ErrorComponent />;
  if (data.length === 0) return <EmptyComponent />;

  const total = data.reduce((acc, curr) => acc + curr.count, 0);

  const handleBarClick = (date: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("status", "New,On Hold,In Progress");

    if (date === "No ETA") {
      params.set("estimated_resolution_date", "null");
    } else {
      params.set("estimated_resolution_date", date);
    }
    params.set("page", "1");
    router.push(`/tickets?${params.toString()}`);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col pb-6 border-b">
        <CardTitle>Open Tickets</CardTitle>
        <CardDescription>
          All open tickets grouped by estimated resolution date —{" "}
          <span className="font-semibold text-foreground">{total}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartBarDefault
          data={data}
          chartConfig={{
            count: { label: "Open tickets", color: "var(--chart-2)" },
          }}
          onBarClick={handleBarClick}
        />
      </CardContent>
    </Card>
  );
};
