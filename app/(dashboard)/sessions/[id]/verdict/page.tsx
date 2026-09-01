import { notFound } from "next/navigation";

import { VerdictReport } from "@/components/shared/verdict-report";
import { getSessionById } from "@/lib/mock-data";

export default async function VerdictPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = getSessionById(id);

  if (!session) notFound();

  return <VerdictReport session={session} />;
}
