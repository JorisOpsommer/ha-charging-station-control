import { Label } from "~/components/ui/label";
import { api } from "~/trpc/server";
import { SetActiveChargingStationForm } from "./_components/set-active-charging-station-form";

export default async function SetActiveChargingStation() {
  const chargingStations = await api.chargingStations.getChargingStations();

  return (
    <div className="m-4 rounded-lg p-4 shadow-lg">
      <Label className="text-lg font-bold">
        Change active charging station
      </Label>
      <br />
      <Label className="text-base">
        Only one charging station can be active at a time. Change the dropdown
        to select your active charging station.
      </Label>

      <SetActiveChargingStationForm chargingStations={chargingStations} />
    </div>
  );
}
