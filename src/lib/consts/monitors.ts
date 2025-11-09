import type { ColumnOption } from "../types/table";
import { formatLabel } from "../utils";
import { ALL_INSTALL_STATUSES } from "./devices";
import type { MonitorFilterKeyType } from "../types/devices";

const MONITOR_FILTER_KEYS: MonitorFilterKeyType[] = [
  "serial_number",
  "model",
  "order_id",
  "install_status",
];

export const MONITOR_COLUMNS: ColumnOption[] = MONITOR_FILTER_KEYS.map(
  (key) => {
    if (key === "install_status") {
      return {
        value: key,
        label: formatLabel(key),
        type: "select",
        options: ALL_INSTALL_STATUSES,
      };
    }

    if (key === "serial_number") {
      return {
        value: key,
        label: formatLabel(key),
        type: "text",
        route: "monitors",
        routeIdPath: "id",
      };
    }

    return {
      value: key,
      label: formatLabel(key),
      type: "text",
    };
  }
);

// User Monitors

const USER_MONITORS_FILTER_KEYS: Array<MonitorFilterKeyType> = [
  "serial_number",
  "model",
  "order_id",
  "install_status",
];

export const USER_MONITORS_COLUMNS: ColumnOption[] =
  USER_MONITORS_FILTER_KEYS.map((key) => {
    if (key === "install_status") {
      return {
        value: key,
        label: formatLabel(key),
        type: "select",
        options: ALL_INSTALL_STATUSES,
      };
    }

    return {
      value: key,
      label: formatLabel(key),
      type: "text",
    };
  });
