import { Label } from "~/components/ui/label";
import AddChargingStationForm from "./_components/add-charging-station-form";

export default async function addChargingStation() {
  return (
    <div className="m-4 rounded-lg p-4 shadow-lg">
      <Label className="text-lg font-bold">Create charging station</Label>
      <br />
      <Label className="text-base">
        Fill in your data and credentials to create a charging station. Click
        save when done.
      </Label>
      <br />
      <Label className="text-sm italic">
        Note: Your credentials are stored locally on your computer.
      </Label>
      <AddChargingStationForm />
    </div>
  );
}
