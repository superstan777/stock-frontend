import { TicketPageComponent } from "@/components/TicketPage/TicketPageComponent";

export default async function TicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TicketPageComponent id={id} />;
}
