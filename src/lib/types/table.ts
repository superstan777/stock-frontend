import type { UserRow } from "./users";
import type { DeviceRow } from "./devices";
import type { TicketRow, TicketWithUsers } from "./tickets";
import type { RelationWithDetails } from "./relations";

export interface ColumnOption<T extends EntityType = EntityType> {
  value: string;
  label: string;
  type?: "text" | "select" | "actions" | "date";
  options?: string[];
  route?: string;
  routeIdPath?: string;
  getRoute?: (row: EntityDataMap[T]) => string;
}

export type EntityType =
  | "user"
  | "computer"
  | "monitor"
  | "ticket"
  | "relation";

export type EntityDataMap = {
  user: UserRow;
  computer: DeviceRow;
  monitor: DeviceRow;
  ticket: TicketWithUsers | TicketRow;
  relation: RelationWithDetails;
};

export type EntityData<T extends EntityType> = EntityDataMap[T];

export type MetaData = {
  count: number;
  current_page: number;
  total_pages: number;
};
