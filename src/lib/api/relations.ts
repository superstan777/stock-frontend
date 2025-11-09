import type { RelationWithDetails } from "@/lib/types/relations";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// --- CREATE RELATION ---
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

// --- END RELATION ---
export const endRelation = async (relationId: string): Promise<void> => {
  const res = await fetch(`${API_URL}/relations/${relationId}/end`, {
    method: "PATCH",
  });

  if (!res.ok) throw new Error("Failed to end relation");
};

// --- GET RELATIONS BY DEVICE ---
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
  return res.json();
};

// --- GET RELATIONS BY USER ---
export const getRelationsByUser = async (
  userId: string
): Promise<RelationWithDetails[]> => {
  const res = await fetch(`${API_URL}/relations/users/${userId}/relations`, {
    method: "GET",
  });

  if (!res.ok) throw new Error("Failed to fetch relations by user");
  return res.json();
};

// --- CHECK ACTIVE RELATION ---
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
