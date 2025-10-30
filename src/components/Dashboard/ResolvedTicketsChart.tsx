"use client";

import { useQuery } from "@tanstack/react-query";
import { getResolvedTicketsStats } from "@/lib/api/tickets";
import { ChartBarInteractive } from "../ui/chart-bar-interactive";
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

export const ResolvedTicketsChart = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    data = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["dashboard", "resolved-tickets-stats"],
    queryFn: getResolvedTicketsStats,
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
    params.set("resolution_date", date);
    params.set("status", "Resolved");
    params.set("page", "1");

    router.push(`/tickets?${params.toString()}`);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col pb-6 border-b">
        <CardTitle>Resolved Tickets</CardTitle>
        <CardDescription>
          Tickets resolved in the past 3 months —{" "}
          <span className="font-semibold text-foreground">{total}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartBarInteractive
          data={data}
          chartConfig={{
            count: {
              label: "Resolved tickets",
              color: "var(--chart-3)",
            },
          }}
          onBarClick={handleBarClick}
        />
      </CardContent>
    </Card>
  );
};
