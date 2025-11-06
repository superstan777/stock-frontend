"use client";

import { useState } from "react";
import { UserForm } from "./UserForm";
import { UserTabs } from "./UserTabs";
import { Button } from "@/components/ui/button";
import { Loader2Icon } from "lucide-react";
import type { UserRow } from "@/lib/types/users";

export function UserPageContent({ user }: { user: UserRow }) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="p-4">
      <div className="flex justify-end">
        <Button type="submit" form="user-form" disabled={isLoading}>
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

      <UserForm user={user} setIsLoading={setIsLoading} />
      <UserTabs userId={user.id} />
    </div>
  );
}
