"use client";

import { DataTable } from "./DataTable";
import { ListHeader } from "./ListHeader";
import { ColumnOption } from "@/lib/types/table";
import type { EntityType, EntityData, MetaData } from "@/lib/types/table";
import { PaginationControls } from "./PaginationControls";

interface ListPageProps<T extends EntityType> {
  entity: T;
  columns: ColumnOption<T>[];
  tableData: EntityData<T>[] | undefined;
  metaData: MetaData | undefined;
  clickableFields?: string[];
  isLoading: boolean;
  error: unknown;
}

export default function ListPage<T extends EntityType>({
  entity,
  columns,
  tableData,
  metaData,
  isLoading,
  error,
}: ListPageProps<T>) {
  return (
    <div className="flex flex-col h-full">
      <ListHeader entity={entity} columns={columns} />

      <DataTable
        data={tableData}
        isLoading={isLoading}
        error={error}
        columns={columns}
        entity={entity}
      />

      {metaData && (
        <PaginationControls
          currentPage={metaData.current_page}
          totalPages={metaData.total_pages}
        />
      )}
    </div>
  );
}
