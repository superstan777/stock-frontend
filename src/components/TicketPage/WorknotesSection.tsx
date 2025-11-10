"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getWorknotes } from "@/lib/api/worknotes";
import { Worknote } from "./Worknote";
import { Loader2Icon } from "lucide-react";

type WorknotesSectionProps = {
  ticketId: string;
  note?: string;
  onNoteChange?: (value: string) => void;
};

export const WorknotesSection: React.FC<WorknotesSectionProps> = ({
  ticketId,
  note = "",
  onNoteChange,
}) => {
  const {
    data: worknotes = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["worknotes", ticketId],
    queryFn: () => getWorknotes(ticketId),
  });

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3">Worknotes</h3>

      <div className="mb-4">
        <textarea
          className="w-full border rounded-lg p-2 text-sm resize-none"
          rows={3}
          placeholder="Add a worknote"
          value={note}
          onChange={(e) => onNoteChange?.(e.target.value)}
        />
      </div>

      {isLoading && (
        <div className="flex justify-center items-center">
          <Loader2Icon className="animate-spin mr-2 h-4 w-4" />
          Loading...
        </div>
      )}
      {isError && (
        <p className="text-sm text-red-500 text-center">
          Error loading worknotes
        </p>
      )}
      {!isLoading && worknotes.length === 0 && (
        <p className="text-sm text-gray-500 text-center">No worknotes yet.</p>
      )}
      {!isLoading &&
        worknotes.map((note) => (
          <Worknote
            key={note.id}
            authorEmail={note.author?.email}
            note={note.note}
            createdAt={note.created_at}
          />
        ))}
    </div>
  );
};
