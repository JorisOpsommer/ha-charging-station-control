import Paper from "~/components/custom/paper";
import { type HA_CHARGE_INSTRUCTION } from "~/models/ha-charge-instruction-enum";
import { api } from "~/trpc/server";
import ChargingSpeedForm from "./_components/charging-speed-form";

export default async function ChargingSpeedsPage() {
  const chargingSpeeds = await api.chargingSpeeds.getChargingSpeeds({});

  return (
    <div className="flex flex-col gap-4">
      {chargingSpeeds.map((speed) => {
        return (
          <Paper
            key={speed.id}
            title={<>{speed.name.toUpperCase()}</>}
            styles="max-w-5xl"
          >
            <ChargingSpeedForm
              chargeInstruction={speed.name as HA_CHARGE_INSTRUCTION}
              id={speed.id}
              unit={speed.unit as any}
              value={speed.stringValue ?? speed.numberValue ?? 0}
            ></ChargingSpeedForm>
          </Paper>
        );
      })}
    </div>
  );
}
