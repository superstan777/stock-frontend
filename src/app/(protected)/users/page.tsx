"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import ListPage from "@/components/ListPage/ListPage";
import { getUsers } from "@/lib/api/users";
import { USER_COLUMNS } from "@/lib/consts/users";
import type { UserFilter } from "@/lib/api/users";

export default function UsersPage() {
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  const filters: UserFilter[] = [];

  searchParams.forEach((value, key) => {
    if (!["page"].includes(key) && value) {
      filters.push({ key: key as UserFilter["key"], value });
    }
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["users", currentPage, filters],
    queryFn: () => getUsers(filters, currentPage),
  });

  return (
    <ListPage
      entity="user"
      columns={USER_COLUMNS}
      tableData={data?.users}
      isLoading={isLoading}
      error={error}
      metaData={data?.meta}
      clickableFields={["name"]}
    />
  );
}
