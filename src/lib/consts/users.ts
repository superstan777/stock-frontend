import type { UserFilterKeyType } from "../types/users";
import type { ColumnOption } from "../types/table";
import { formatLabel } from "../utils";

const USER_FILTER_KEYS: UserFilterKeyType[] = ["name", "email"];

export const USER_COLUMNS: ColumnOption[] = USER_FILTER_KEYS.map((key) => {
  if (key === "name") {
    return {
      value: key,
      label: formatLabel(key),
      type: "text",
      route: "users",
      routeIdPath: "id",
    };
  }

  return {
    value: key,
    label: formatLabel(key),
    type: "text",
  };
});
