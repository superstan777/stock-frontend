import type { ChartBarData } from "@/components/ui/chart-bar-default";

export type TicketRow = {
  assigned_to: string | null;
  caller_id: string | null;
  created_at: string;
  description: string | null;
  estimated_resolution_date: string | null;
  id: string;
  number: number;
  resolution_date: string | null;
  status: string;
  title: string;
};
export type TicketInsert = {
  assigned_to?: string | null | undefined;
  caller_id?: string | null | undefined;
  created_at?: string | undefined;
  description?: string | null | undefined;
  estimated_resolution_date?: string | null | undefined;
  id?: string | undefined;
  number?: number | undefined;
  resolution_date?: string | null | undefined;
  status?: string | undefined;
  title: string;
};
export type TicketUpdate = {
  assigned_to?: string | null | undefined;
  caller_id?: string | null | undefined;
  created_at?: string | undefined;
  description?: string | null | undefined;
  estimated_resolution_date?: string | null | undefined;
  id?: string | undefined;
  number?: number | undefined;
  resolution_date?: string | null | undefined;
  status?: string | undefined;
  title?: string | undefined;
};

export type TicketWithUsers = Omit<TicketRow, "caller_id" | "assigned_to"> & {
  caller: { id: string; email: string | null } | null;
  assigned_to: { id: string; email: string | null } | null;
};

export interface TicketsStats extends ChartBarData {
  date: string;
  count: number;
}

export interface OperatorInfo {
  id: string | null;
  name: string | null;
  email: string | null;
}

export interface OperatorTicketsStats {
  operator: OperatorInfo;
  count: number;
}

export type TicketStatus =
  | "new"
  | "on_hold"
  | "in_progress"
  | "resolved"
  | "cancelled";
