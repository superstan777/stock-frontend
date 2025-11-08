import type {
  TicketRow,
  TicketInsert,
  TicketUpdate,
  TicketWithUsers,
  OperatorTicketsStats,
  TicketsStats,
} from "../types/tickets";
import type { MetaData } from "../types/table";

export interface TicketFilter {
  key: string;
  value: string;
}

const API_URL = "http://localhost:8080/api";

export const getTickets = async (
  filters: TicketFilter[] = [],
  page: number = 1
): Promise<{ tickets: TicketWithUsers[]; meta: MetaData }> => {
  const params = new URLSearchParams();

  // najpierw filtry
  for (const f of filters) {
    if (f.value) params.append(f.key, f.value);
  }

  // na końcu page
  params.append("page", page.toString());

  const res = await fetch(`${API_URL}/tickets?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`API error: ${res.statusText}`);
  }

  const json = await res.json();
  return json.data;
};

export const getTicket = async (
  id: string
): Promise<TicketWithUsers | null> => {
  const res = await fetch(`${API_URL}/tickets/${id}`);
  if (!res.ok) {
    throw new Error(`Get ticket failed: ${res.statusText}`);
  }

  const json = await res.json();
  return json.data ?? null;
};

export const addTicket = async (ticket: TicketInsert): Promise<TicketRow[]> => {
  const res = await fetch(`${API_URL}/tickets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ticket),
  });

  if (!res.ok) {
    throw new Error(`Add ticket failed: ${res.statusText}`);
  }

  const json = await res.json();
  return json.data ?? [];
};

export const updateTicket = async (
  id: string,
  updates: TicketUpdate
): Promise<TicketRow[]> => {
  const res = await fetch(`${API_URL}/tickets/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    throw new Error(`Update ticket failed: ${res.statusText}`);
  }

  const json = await res.json();
  return json.data ?? [];
};

export const deleteTicket = async (id: string): Promise<void> => {
  const res = await fetch(`${API_URL}/tickets/${id}`, { method: "DELETE" });
  if (!res.ok) {
    throw new Error(`Delete ticket failed: ${res.statusText}`);
  }
};

export const getResolvedTicketsStats = async (): Promise<TicketsStats[]> => {
  const res = await fetch(`${API_URL}/tickets/stats/resolved`);
  if (!res.ok) {
    throw new Error(`Get resolved tickets stats failed: ${res.statusText}`);
  }

  const json = await res.json();
  return json.data ?? [];
};

export const getOpenTicketsStats = async (): Promise<TicketsStats[]> => {
  const res = await fetch(`${API_URL}/tickets/stats/open`);
  if (!res.ok) {
    throw new Error(`Get open tickets stats failed: ${res.statusText}`);
  }

  const json = await res.json();

  return json.data ?? [];
};

export const getOperatorTicketsStats = async (): Promise<
  OperatorTicketsStats[]
> => {
  const res = await fetch(`${API_URL}/tickets/stats/operators`);
  if (!res.ok) {
    throw new Error(`Get operator tickets stats failed: ${res.statusText}`);
  }

  const json = await res.json();
  return json.data ?? [];
};
