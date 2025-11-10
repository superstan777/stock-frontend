import { type UserRow, type UserInsert, type UserUpdate } from "../types/users";
import type { UserFilter } from "../types/users";
import { API_URL } from "../consts/api";

export const getUsers = async (
  filters: UserFilter[] = [],
  page: number = 1
): Promise<{
  data: UserRow[];
  meta: { count: number; current_page: number; total_pages: number };
}> => {
  const params = new URLSearchParams();

  params.append("page", page.toString());

  for (const { key, value } of filters) {
    if (value) params.append(key, value);
  }

  const res = await fetch(`${API_URL}/users?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch users: ${res.status}`);
  }

  const json = await res.json();

  return json;
};

export const getUser = async (id: string): Promise<UserRow | null> => {
  const res = await fetch(`${API_URL}/users/${id}`);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Failed to fetch user: ${res.status}`);
  }
  const json = await res.json();

  return json.data;
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
