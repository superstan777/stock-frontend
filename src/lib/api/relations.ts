import type { RelationWithDetails } from "@/lib/types/relations";
import { API_URL } from "../consts/api";

export const createRelation = async (input: {
  user_id: string;
  device_id: string;
  start_date?: string;
}): Promise<RelationWithDetails> => {
  const res = await fetch(`${API_URL}/relations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) throw new Error("Failed to create relation");
  return res.json();
};

export const endRelation = async (relationId: string): Promise<void> => {
  const res = await fetch(`${API_URL}/relations/${relationId}/end`, {
    method: "PATCH",
  });

  if (!res.ok) throw new Error("Failed to end relation");
};

export const getRelationsByDevice = async (
  deviceId: string
): Promise<RelationWithDetails[]> => {
  const res = await fetch(
    `${API_URL}/relations/devices/${deviceId}/relations`,
    {
      method: "GET",
    }
  );

  if (!res.ok) throw new Error("Failed to fetch relations by device");
  const json = await res.json();
  return json.data;
};

export const getRelationsByUser = async (
  userId: string
): Promise<RelationWithDetails[]> => {
  const res = await fetch(`${API_URL}/relations/users/${userId}/relations`, {
    method: "GET",
  });

  if (!res.ok) throw new Error("Failed to fetch relations by user");
  const json = await res.json();
  return json.data;
};

export const hasActiveRelation = async (deviceId: string): Promise<boolean> => {
  const res = await fetch(
    `${API_URL}/relations/devices/${deviceId}/relations/active`,
    {
      method: "GET",
    }
  );

  if (!res.ok) throw new Error("Failed to check active relation");
  const data = await res.json();
  return data.active;
};
