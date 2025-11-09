import type { DeviceRow } from "./devices";
import type { UserRow } from "./users";

export type DevicesColumnType = {
  label: string;
  value: string;
};

export type RelationRow = {
  device_id: string;
  end_date: string | null;
  id: string;
  start_date: string;
  user_id: string;
};
export type RelationInsert = {
  device_id: string;
  end_date?: string | null | undefined;
  id?: string | undefined;
  start_date: string;
  user_id: string;
};
export type RelationUpdate = {
  device_id?: string | undefined;
  end_date?: string | null | undefined;
  id?: string | undefined;
  start_date?: string | undefined;
  user_id?: string | undefined;
};
export type RelationWithDetails = Omit<RelationRow, "user_id" | "device_id"> & {
  user: UserRow;
  device: DeviceRow;
};

export type RelationFilterKeyType =
  | "user.email"
  | "device.serial_number"
  | "device.model"
  | "device.device_type"
  | "start_date"
  | "end_date";
