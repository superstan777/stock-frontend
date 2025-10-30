"use client";

import { useQuery } from "@tanstack/react-query";
import { getDevice } from "@/lib/api/devices";
import { getRelationsByDevice } from "@/lib/api/relations";
import { DevicePageContent } from "./DevicePageContent";
import { EntityNotFound } from "../EntityNotFound";
import { Loader2 } from "lucide-react";

export function DevicePage({ id }: { id: string }) {
  const deviceQuery = useQuery({
    queryKey: ["device", id],
    queryFn: () => getDevice(id),
  });

  const relationsQuery = useQuery({
    queryKey: ["deviceRelations", id],
    queryFn: () => getRelationsByDevice(id),
  });

  if (deviceQuery.isLoading || relationsQuery.isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2
          className="animate-spin text-muted-foreground"
          data-testid="loader"
        />
      </div>
    );
  }

  if (deviceQuery.isError || relationsQuery.isError || !deviceQuery.data) {
    return <EntityNotFound />;
  }

  return (
    <DevicePageContent
      device={deviceQuery.data}
      relations={relationsQuery.data ?? []}
    />
  );
}
