"use client";

import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import { SearchControls } from "./SearchControls";
import type { ColumnOption, EntityType } from "@/lib/types/table";
import { FormDialog } from "./FormDialog";
import { ActiveFilters } from "./ActiveFilters";

interface ListHeaderProps<T extends EntityType> {
  entity: T;
  columns: ColumnOption<T>[];
}

export const ListHeader = <T extends EntityType>({
  entity,
  columns,
}: ListHeaderProps<T>) => {
  const pathname = usePathname();
  const title =
    pathname === "/"
      ? "Dashboard"
      : pathname.replace(/^\//, "").replace(/^\w/, (c) => c.toUpperCase());

  return (
    <header className="flex flex-col gap-2 mb-4 p-2 ">
      <div className="flex items-center justify-between w-full gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{title}</h1>
          <SearchControls pathname={pathname} columns={columns} />
        </div>

        <FormDialog
          entity={entity}
          trigger={
            <Button className="inline-flex items-center gap-2">
              Create {entity}
            </Button>
          }
        />
      </div>

      <ActiveFilters />
    </header>
  );
};
