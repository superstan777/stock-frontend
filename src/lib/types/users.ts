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
