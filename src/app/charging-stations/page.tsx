import Link from "next/link";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/server";
import { ListChargingStations } from "./_components/list-charging-stations";

export default async function ChargingStations() {
  const chargingStations = await api.chargingStations.getChargingStations();
  return (
    <div>
      <div className="flex justify-end">
        <Button asChild>
          <Link href="/charging-stations/add">Add</Link>
        </Button>
      </div>
      <ListChargingStations chargingStations={chargingStations} />
    </div>
  );
}
