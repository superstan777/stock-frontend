import type { TicketStatus } from "../types/tickets";
import type { ColumnOption } from "../types/table";
import { formatLabel } from "../utils";

export const ALL_TICKET_STATUSES: TicketStatus[] = [
  "new",
  "on_hold",
  "in_progress",
  "resolved",
  "cancelled",
];
// const TICKET_FILTER_KEYS: Array<TicketFilterKeyType> = [ // typy do poprawy

const TICKET_FILTER_KEYS = [
  "number",
  "title",
  "status",
  "caller.email",
  "assigned_to.email",
  "estimated_resolution_date",
  "resolution_date",
] as const;

export const TICKET_COLUMNS: ColumnOption[] = TICKET_FILTER_KEYS.map((key) => {
  if (key === "number") {
    return {
      value: key,
      label: formatLabel(key),
      type: "text" as const,
      route: "tickets",
      routeIdPath: "id",
    };
  }

  if (key === "caller.email") {
    return {
      value: key,
      label: formatLabel(key),
      type: "text",
      route: "users",
      routeIdPath: "caller.id",
    };
  }

  if (key === "estimated_resolution_date" || key === "resolution_date") {
    return {
      value: key,
      label: formatLabel(key),
      type: "date",
    };
  }

  return {
    value: key,
    label: formatLabel(key),
    type: "text",
  };
});
