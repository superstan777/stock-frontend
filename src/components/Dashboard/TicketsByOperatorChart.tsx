"use client";

import { useQuery } from "@tanstack/react-query";
import { getTicketsByOperator } from "@/lib/api/tickets";
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

export const TicketsByOperatorChart = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    data = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["dashboard", "tickets-by-operator"],
    queryFn: getTicketsByOperator,
  });

  if (isLoading)
    return (
      <Card
        className="flex justify-center items-center h-48"
        data-testid="loader"
      >
        <Loader2 className="animate-spin text-muted-foreground" />
      </Card>
    );

  if (isError) return <ErrorComponent />;
  if (data.length === 0) return <EmptyComponent />;

  const total = data.reduce((acc, curr) => acc + curr.count, 0);

  const handleBarClick = (email: string | null) => {
    const params = new URLSearchParams(searchParams);
    params.set("status", "New,On Hold,In Progress");

    if (!email) {
      params.set("assigned_to", "null");
      params.delete("assigned_to.email");
    } else {
      params.set("assigned_to.email", email);
      params.delete("assigned_to");
    }

    params.set("page", "1");
    router.push(`/tickets?${params.toString()}`);
  };

  const chartData = data.map((d) => ({
    name: d.operator.name,
    email: d.operator.id ? d.operator.email : null,
    count: d.count,
  }));

  return (
    <Card>
      <CardHeader className="flex flex-col pb-6 border-b">
        <CardTitle>Open Tickets by Operator</CardTitle>
        <CardDescription>
          All open tickets grouped by operator —{" "}
          <span className="font-semibold text-foreground">{total}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartBarDefault
          data={chartData}
          chartConfig={{
            count: { label: "Tickets", color: "var(--chart-1)" },
          }}
          dataKey="name"
          onBarClick={(name) => {
            const clicked = chartData.find((d) => d.name === name);
            handleBarClick(clicked?.email ?? null);
          }}
        />
      </CardContent>
    </Card>
  );
};
