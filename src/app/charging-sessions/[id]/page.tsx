import { api } from "~/trpc/server";
import { ChargingSessionsTable } from "./_components/charging-sessions-table";

export default async function chargingSessions({
  params,
}: {
  params: { id: string };
}) {
  const sessions = await api.chargingSessions.getSessions({
    chargingStationId: params.id,
  });
  return (
    <div>
      <ChargingSessionsTable sessions={sessions} />
    </div>
  );
}
