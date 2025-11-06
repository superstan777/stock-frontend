import { UserPage } from "@/components/UsersPage/UserPage";

export default async function ComputerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <UserPage id={id} />;
}
