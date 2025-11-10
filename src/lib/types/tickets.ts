import type { ChartBarData } from "@/components/ui/chart-bar-default";
import type { EntityFilter } from "./common";

export type TicketRow = {
  operator_id: string | null;
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
  operator_id?: string | null | undefined;
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
  operator_id?: string | null | undefined;
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

export type TicketWithUsers = Omit<TicketRow, "caller_id" | "operator_id"> & {
  caller: { id: string; email: string | null } | null;
  operator: { id: string; email: string | null } | null;
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

type AllTicketKeys = keyof TicketWithUsers;

export type TicketFilterKeyType = Extract<
  AllTicketKeys | "caller.email" | "operator.email",
  | "number"
  | "title"
  | "status"
  | "caller.email"
  | "operator.email"
  | "estimated_resolution_date"
  | "resolution_date"
>;

export type TicketQueryKeyType = TicketFilterKeyType | "caller.id";

export type TicketFilter = EntityFilter<TicketQueryKeyType>;
