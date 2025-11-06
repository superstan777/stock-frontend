import { type UserRow, type UserInsert, type UserUpdate } from "../types/users";
import type { UserFilterKeyType } from "../consts/users";

export type UserFilter = {
  key: UserFilterKeyType;
  value: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getUsers = async (
  filters: UserFilter[] = [],
  page: number = 1
): Promise<{
  users: UserRow[];
  meta: { count: number; current_page: number; total_pages: number };
}> => {
  const params = new URLSearchParams();

  // Paginacja
  params.append("page", page.toString());

  // Filtry
  for (const { key, value } of filters) {
    if (value) params.append(key, value);
  }

  const res = await fetch(`${API_URL}/users?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch users: ${res.status}`);
  }

  const json = await res.json();
  return json.data;
};

export const getUser = async (id: string): Promise<UserRow | null> => {
  const res = await fetch(`${API_URL}/users/${id}`);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Failed to fetch user: ${res.status}`);
  }
  const json = await res.json();

  return json.data ?? null;
};

export const addUser = async (user: UserInsert): Promise<UserRow> => {
  const res = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error(`Failed to add user: ${res.status}`);
  const json = await res.json();
  return json.data?.user ?? json.user;
};

export const updateUser = async (
  id: string,
  updates: UserUpdate
): Promise<UserRow> => {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error(`Failed to update user: ${res.status}`);
  const json = await res.json();
  return json.data?.user ?? json.user;
};

export const deleteUser = async (id: string): Promise<void> => {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Failed to delete user: ${res.status}`);
};
