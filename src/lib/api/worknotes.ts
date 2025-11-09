import type { WorknoteInsert, WorknoteWithAuthor } from "../types/worknotes";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export const getWorknotes = async (
  ticketId: string
): Promise<WorknoteWithAuthor[]> => {
  const res = await fetch(`${API_URL}/worknotes?ticket_id=${ticketId}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to fetch worknotes");
  }

  const data = await res.json();
  return data.data ?? data;
};

export const addWorknote = async (
  worknote: WorknoteInsert
): Promise<WorknoteWithAuthor> => {
  const res = await fetch(`${API_URL}/worknotes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(worknote),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to add worknote");
  }

  const data = await res.json();
  return data.data ?? data;
};
