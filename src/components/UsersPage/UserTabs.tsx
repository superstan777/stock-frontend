"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UserDevicesList } from "./UserDevicesList";
import { UserTicketsList } from "./UserTicketsList";
import { getRelationsByUser } from "@/lib/api/relations";
import { getUserTickets } from "@/lib/api/tickets";
import type { RelationWithDetails } from "@/lib/types/relations";
import { RelationForm } from "./RelationForm";

interface UserTabsProps {
  userId: string;
}

export function UserTabs({ userId }: UserTabsProps) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    queryClient.prefetchQuery({
      queryKey: ["userRelations", userId],
      queryFn: () => getRelationsByUser(userId),
    });

    queryClient.prefetchQuery({
      queryKey: ["userTickets", userId],
      queryFn: () => getUserTickets(userId),
    });
  }, [userId, queryClient]);

  const relationsQuery = useQuery<RelationWithDetails[]>({
    queryKey: ["userRelations", userId],
    queryFn: () => getRelationsByUser(userId),
  });

  const ticketsQuery = useQuery({
    queryKey: ["userTickets", userId],
    queryFn: () => getUserTickets(userId),
  });

  const triggerClass =
    "px-4 py-2 rounded-t-md border-b-2 border-transparent " +
    "data-[state=active]:border-b-gray-200 data-[state=active]:-mb-px " +
    "data-[state=active]:text-gray-900";

  return (
    <div className="mt-6 w-full">
      <Tabs defaultValue="devices" className="w-full">
        <div className="flex justify-center border-b border-gray-200">
          <TabsList className="inline-flex mb-0 space-x-4">
            <TabsTrigger value="devices" className={triggerClass}>
              Devices
            </TabsTrigger>

            <TabsTrigger value="tickets" className={triggerClass}>
              Tickets
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="devices">
          <RelationForm defaultUserId={userId} />
          <UserDevicesList
            userId={userId}
            relations={relationsQuery.data ?? []}
            isLoading={relationsQuery.isLoading}
            isError={relationsQuery.isError}
            error={relationsQuery.error}
          />
        </TabsContent>

        <TabsContent value="tickets">
          <UserTicketsList
            userId={userId}
            tickets={ticketsQuery.data?.data ?? []}
            isLoading={ticketsQuery.isLoading}
            isError={ticketsQuery.isError}
            error={ticketsQuery.error}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
