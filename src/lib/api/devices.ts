import type {
  DeviceType,
  DeviceRow,
  DeviceUpdate,
  DeviceInsert,
} from "../types/devices";
import type { MetaData } from "../types/table";
import { API_URL } from "../consts/api";
import type { MonitorFilter, ComputerFilter } from "../types/devices";

export const getDevices = async (
  deviceType: DeviceType,
  filters: MonitorFilter[] | ComputerFilter[] = [],
  page: number = 1
): Promise<{
  devices: DeviceRow[];
  meta: MetaData;
}> => {
  const params = new URLSearchParams();
  params.append("page", page.toString());

  for (const f of filters) {
    if (f.value) params.append(f.key, f.value);
  }

  const res = await fetch(
    `${API_URL}/devices/${deviceType}s?${params.toString()}`
  );
  if (!res.ok) {
    throw new Error(`API error: ${res.statusText}`);
  }

  const json = await res.json();

  return json.data;
};

export const addDevice = async (device: DeviceInsert): Promise<DeviceRow[]> => {
  const res = await fetch(`${API_URL}/devices`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(device),
  });
  if (!res.ok) {
    throw new Error(`Add device failed: ${res.statusText}`);
  }
  const json = await res.json();
  return json.data ?? [];
};

export const updateDevice = async (
  id: string,
  updates: DeviceUpdate
): Promise<DeviceRow[]> => {
  const res = await fetch(`${API_URL}/device/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    throw new Error(`Update device failed: ${res.statusText}`);
  }
  const json = await res.json();
  return json.data ?? [];
};

export const deleteDevice = async (id: string): Promise<void> => {
  const res = await fetch(`${API_URL}/device/${id}`, { method: "DELETE" });
  if (!res.ok) {
    throw new Error(`Delete device failed: ${res.statusText}`);
  }
};

export const getDevice = async (id: string): Promise<DeviceRow | null> => {
  const res = await fetch(`${API_URL}/device/${id}`);
  if (!res.ok) {
    throw new Error(`Get device failed: ${res.statusText}`);
  }
  const json = await res.json();

  return json.data ?? null;
};

export const getAllDevices = async (): Promise<{
  devices: DeviceRow[];
  meta: MetaData;
}> => {
  const res = await fetch(`${API_URL}/devices`);
  if (!res.ok) {
    throw new Error(`Get all devices failed: ${res.statusText}`);
  }
  const json = await res.json();
  console.log(json.data);

  return json.data ?? [];
};
