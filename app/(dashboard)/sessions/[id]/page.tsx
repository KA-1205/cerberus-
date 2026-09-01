import { notFound } from "next/navigation";

import { SessionPlayback } from "@/components/shared/session-playback";
import { getSessionById } from "@/lib/mock-data";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = getSessionById(id);

  if (!session) notFound();

  return <SessionPlayback session={session} />;
}
