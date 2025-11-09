import type { ColumnOption } from "../types/table";
import { formatLabel } from "../utils";
import type { RelationFilterKeyType } from "../types/relations";

const RELATION_FILTER_KEYS: RelationFilterKeyType[] = [
  "user.email",
  "device.serial_number",
  "device.model",
  "device.device_type",
  "start_date",
  "end_date",
];

export const RELATION_ACTION_COLUMN: ColumnOption<"relation"> = {
  value: "actions",
  label: "Actions",
  type: "actions",
};

export const RELATION_COLUMNS: ColumnOption<"relation">[] =
  RELATION_FILTER_KEYS.map((key) => {
    if (key === "device.serial_number") {
      return {
        value: key,
        label: formatLabel(key),
        routeIdPath: "device.id",
        getRoute: (row) =>
          row.device.device_type === "computer" ? "computers" : "monitors",
      };
    }

    if (key === "user.email") {
      return {
        value: key,
        label: formatLabel(key),
        route: "users",
        routeIdPath: "user.id",
      };
    }

    if (key === "start_date" || key === "end_date") {
      return {
        value: key,
        label: formatLabel(key),
        type: "text",
        format: "date",
      };
    }

    return {
      value: key,
      label: formatLabel(key),
      type: "text",
    };
  });

export const DEVICE_PAGE_RELATION_COLUMNS: ColumnOption<"relation">[] = [
  {
    value: "user.email",
    label: "User",
    route: "users",
    routeIdPath: "user.id",
  },
  {
    value: "start_date",
    label: "Start Date",
    type: "date",
  },
  {
    value: "end_date",
    label: "End Date",
    type: "date",
  },
  RELATION_ACTION_COLUMN,
];

export const USER_PAGE_RELATION_COLUMNS: ColumnOption<"relation">[] = [
  {
    value: "device.serial_number",
    label: "Serial Number",
    routeIdPath: "device.id",
    getRoute: (row) =>
      row.device.device_type === "computer" ? "computers" : "monitors",
  },
  {
    value: "device.model",
    label: "Model",
    type: "text",
  },
  {
    value: "device.device_type",
    label: "Device Type",
    type: "text",
  },

  {
    value: "device.order_id",
    label: "Order ID",
    type: "text",
  },
  {
    value: "start_date",
    label: "Start Date",
    type: "date",
  },
  {
    value: "end_date",
    label: "End Date",
    type: "date",
  },
  RELATION_ACTION_COLUMN,
];
