"use client";

import { useState } from "react";
import { TicketForm } from "./TicketForm";
import { WorknotesSection } from "./WorknotesSection";
import { Button } from "@/components/ui/button";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTicket } from "@/lib/api/tickets";
import { addWorknote } from "@/lib/api/worknotes";

import type { TicketUpdate, TicketWithUsers } from "@/lib/types/tickets";

export function TicketPageContent({ ticket }: { ticket: TicketWithUsers }) {
  const [isLoading, setIsLoading] = useState(false);
  const [worknote, setWorknote] = useState("");
  const queryClient = useQueryClient();
  // temporary solution, will be changed after migration to own backend
  const currentUserId = "04121166-bc6b-4cc9-99b4-5115185e9ff2";

  const mutation = useMutation({
    mutationFn: async (formData: TicketUpdate) => {
      if (!worknote.trim()) {
        throw new Error("Worknote is required when updating a ticket");
      }

      await updateTicket(ticket.id, formData);

      await addWorknote({
        ticket_id: ticket.id,
        note: worknote.trim(),
        author_id: currentUserId,
      });
    },
    onMutate: () => setIsLoading(true),
    onSettled: () => setIsLoading(false),
    onSuccess: () => {
      toast.success("Ticket updated and worknote added");
      setWorknote("");
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["worknotes", ticket.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update ticket");
    },
  });

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-end">
        <Button type="submit" form="ticket-form" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2Icon className="animate-spin mr-2 h-4 w-4" />
              Please wait
            </>
          ) : (
            "Update"
          )}
        </Button>
      </div>

      <TicketForm
        ticket={ticket}
        setIsLoading={setIsLoading}
        onSubmit={(formData) => {
          mutation.mutate(formData);
        }}
      />

      <WorknotesSection
        ticketId={ticket.id}
        note={worknote}
        onNoteChange={setWorknote}
      />
    </div>
  );
}
