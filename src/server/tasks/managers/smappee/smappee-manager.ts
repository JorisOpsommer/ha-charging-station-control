import { type HA_CHARGE_INSTRUCTION } from "~/models/ha-charge-instruction-enum";
import { type STATION_CHARGE_STATE } from "~/models/station-charge-state-enum";
import { db } from "~/server/db";
import { jobManager } from "../cron-job-manager";
import {
  getCurrentChargingState,
  overwriteSmappeeChargingState,
} from "./charging/current-charging-state";
import { handleParkingSessions } from "./parking-manager/parking-manager";
import { stationControl } from "./station-control/station-control";

export const smappeeManager = async () => {
  jobManager.startJob(
    "smappeeDecisionMaker",
    "0 * * * * *",
    () => void decisionMaker(),
  );
  jobManager.startJob("smappeeHandleParkingSessions", "*/3 * * * *", () => {
    void handleParkingSessions();
  });
  jobManager.startJob("smappeeOverwriteChargingState", "*/5 * * * *", () => {
    void overwriteSmappeeChargingState();
  });
};

const decisionMaker = async () => {
  const dataPoints = await db.homeAssistantData.findFirst({
    orderBy: { createdAt: "desc" },
  });
  const currentChargingState = await getCurrentChargingState();

  const currentChargeInstruction = await db.instructionStateChange.findFirst({
    orderBy: { changedAt: "desc" },
    take: 1,
  });

  await stationControl({
    currentChargeInstruction:
      currentChargeInstruction?.state as HA_CHARGE_INSTRUCTION,
    currentChargingState: currentChargingState?.state as STATION_CHARGE_STATE,
    sensorInverterSolarInWatt: dataPoints?.inverterOutputInWatt ?? 0,
    sensorPowerConsumedInWatt: dataPoints?.powerConsumptionInWatt ?? 0,
  });
};
