"use client";

import { useState } from "react";
import { DeviceForm } from "./DeviceForm";
import { Button } from "@/components/ui/button";
import { Loader2Icon } from "lucide-react";
import type { DeviceRow } from "@/lib/types/devices";
import type { RelationWithDetails } from "@/lib/types/relations";
import { DeviceHistory } from "./DeviceHistory";

export function DevicePageContent({
  device,
  relations,
}: {
  device: DeviceRow;
  relations: RelationWithDetails[];
}) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-end">
        <Button type="submit" form="device-form" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2Icon
                className="animate-spin mr-2 h-4 w-4"
                data-testid="loader"
              />
              Please wait
            </>
          ) : (
            "Update"
          )}
        </Button>
      </div>
      <DeviceForm device={device} setIsLoading={setIsLoading} />
      <DeviceHistory
        relations={relations}
        deviceId={device.id}
        isLoading={false}
      />
    </div>
  );
}
