import type { EntityFilter } from "./common";
export type UserRow = {
  created_at: string;
  email: string;
  id: string;
  name: string;
};

export type UserInsert = {
  email: string;
  name: string;
};

export type UserUpdate = {
  email?: string;
  name?: string;
};

type AllUserKeys = keyof UserRow;
export type UserFilterKeyType = Exclude<AllUserKeys, "id" | "created_at">;

export type UserFilter = EntityFilter<UserFilterKeyType>;
