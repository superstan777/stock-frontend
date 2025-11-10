"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export interface ChartBarData {
  [key: string]: string | number | null;
}

interface ChartBarDefaultProps<T extends ChartBarData> {
  data: T[];
  chartConfig: ChartConfig;
  dataKey?: keyof T;
  tickFormatter?: (value: string | number) => string;
  tooltipLabelFormatter?: (value: string | number) => string;
  onBarClick?: (value: string) => void;
}

export function ChartBarDefault<T extends ChartBarData>({
  data,
  chartConfig,
  dataKey,
  tickFormatter,
  tooltipLabelFormatter,
  onBarClick,
}: ChartBarDefaultProps<T>) {
  const firstKey = Object.keys(chartConfig)[0] as keyof T;
  const xKey = dataKey || ("date" as keyof T);

  const defaultTickFormatter = (value: string | number) => {
    if (xKey === "date") {
      if (value === "No ETA") return "No ETA";
      const date = new Date(value as string);
      return isNaN(date.getTime())
        ? String(value)
        : date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
    return String(value);
  };

  const defaultTooltipLabelFormatter = (value: string | number) => {
    if (xKey === "date") {
      if (value === "No ETA") return "No ETA";
      const date = new Date(value as string);
      return isNaN(date.getTime())
        ? String(value)
        : date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
    }
    return String(value);
  };

  return (
    <ChartContainer config={chartConfig}>
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey={xKey as string}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
          tickFormatter={tickFormatter || defaultTickFormatter}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              hideLabel
              labelFormatter={
                tooltipLabelFormatter || defaultTooltipLabelFormatter
              }
            />
          }
        />
        <Bar
          dataKey={firstKey as string}
          fill={`var(--color-${String(firstKey)})`}
          radius={8}
          style={{ cursor: onBarClick ? "pointer" : "default" }}
          onClick={(entry) => {
            if (!onBarClick) return;
            const value = entry?.payload?.[xKey];
            if (typeof value === "string") onBarClick(value);
          }}
        />
      </BarChart>
    </ChartContainer>
  );
}
