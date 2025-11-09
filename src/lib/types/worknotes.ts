export type WorknoteRow = {
  author_id: string;
  created_at: string;
  id: string;
  note: string;
  ticket_id: string;
};
export type WorknoteInsert = {
  author_id?: string | undefined;
  created_at?: string | undefined;
  id?: string | undefined;
  note: string;
  ticket_id?: string | undefined;
};
export type WorknoteWithAuthor = Omit<WorknoteRow, "author_id"> & {
  author: {
    id: string;
    email: string;
  } | null;
};
