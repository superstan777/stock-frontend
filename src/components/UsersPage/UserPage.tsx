"use client";

import { useQuery } from "@tanstack/react-query";
import { getUser } from "@/lib/api/users";
import { UserPageContent } from "@/components/UsersPage/UserPageContent";
import { EntityNotFound } from "@/components/EntityNotFound";
import { Loader2 } from "lucide-react";

export function UserPage({ id }: { id: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["user", id],
    queryFn: () => getUser(id),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2
          className="animate-spin text-muted-foreground"
          data-testid="loader"
        />
      </div>
    );
  }

  if (isError || !data) {
    return <EntityNotFound />;
  }

  return <UserPageContent user={data} />;
}
