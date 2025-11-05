import { Database } from "../types/supabase";

export type DevicesColumnType = {
  label: string;
  value: string;
};

export type DeviceType = "computer" | "monitor";
export type InstallStatus =
  | "deployed"
  | "in_inventory"
  | "end_of_life"
  | "disposed";

export type DeviceRow = {
  created_at: string | null;
  device_type: DeviceType;
  id: string;
  install_status: InstallStatus;
  model: string;
  order_id: string;
  serial_number: string;
};
export type DeviceInsert = {
  created_at?: string | null | undefined;
  device_type: DeviceType;
  id?: string | undefined;
  install_status: InstallStatus;
  model: string;
  order_id: string;
  serial_number: string;
};

// tutaj do poprawki
export type DeviceUpdate = {
  created_at?: string | null | undefined;
  device_type?: "computer" | "monitor" | undefined;
  id?: string | undefined;
  install_status?:
    | "deployed"
    | "in_inventory"
    | "end_of_life"
    | "disposed"
    | undefined;
  model?: string | undefined;
  order_id?: string | undefined;
  serial_number?: string | undefined;
};
