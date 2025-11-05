import type { DeviceType, InstallStatus } from "../types/devices";

export const ALL_INSTALL_STATUSES: InstallStatus[] = [
  "in_inventory",
  "disposed",
  "end_of_life",
  "deployed",
];

export const ALL_DEVICE_TYPES: DeviceType[] = ["computer", "monitor"];
