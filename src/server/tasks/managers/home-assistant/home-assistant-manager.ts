import { SYSTEM_SETTINGS_KEYS } from "~/models/system-settings-keys.enum";
import { db } from "~/server/db";
import { logger } from "~/server/utils/logger";
import { getEntityState } from "./entities/get-entity-state";

let HA_SENSOR_INVERTER_SOLAR: string;
let HA_SENSOR_POWER_CONSUMPTION: string;

export const fetchHomeAssistantData = async () => {
  if (!HA_SENSOR_INVERTER_SOLAR || !HA_SENSOR_POWER_CONSUMPTION)
    await dbConstants();

  const sensorPowerConsumed = await getEntityState(HA_SENSOR_POWER_CONSUMPTION);
  const sensorInverterSolar = await getEntityState(HA_SENSOR_INVERTER_SOLAR);

  if (!sensorPowerConsumed?.attributes?.unit_of_measurement) return;

  if (!sensorInverterSolar?.attributes?.unit_of_measurement) return;

  let sensorPowerConsumedInWatt = Number(sensorPowerConsumed.state);
  if (sensorPowerConsumed.attributes.unit_of_measurement.toLowerCase() === "kw")
    sensorPowerConsumedInWatt *= 1000;

  let sensorInverterSolarInWatt = Number(sensorInverterSolar.state);
  if (sensorInverterSolar.attributes.unit_of_measurement.toLowerCase() === "kw")
    sensorInverterSolarInWatt *= 1000;

  await writeDataToDb({
    sensorInverterSolarInWatt: sensorInverterSolarInWatt,
    sensorPowerConsumedInWatt: sensorPowerConsumedInWatt,
  });
};

const writeDataToDb = async ({
  sensorInverterSolarInWatt,
  sensorPowerConsumedInWatt,
}: {
  sensorInverterSolarInWatt: number;
  sensorPowerConsumedInWatt: number;
}) => {
  try {
    await db.homeAssistantData.create({
      data: {
        inverterOutputInWatt: sensorInverterSolarInWatt,
        powerConsumptionInWatt: sensorPowerConsumedInWatt,
      },
    });
  } catch (error: any) {
    logger.error(
      "Error in home-assistant-manager, writeDataToDb, db.homeAssistantData.create, data: inverterOutputInWatt",
      sensorInverterSolarInWatt,
      "powerConsumptionInWatt",
      sensorPowerConsumedInWatt,
    );
  }
};

const dbConstants = async () => {
  const inverter = await db.systemSetting.findFirst({
    where: { key: SYSTEM_SETTINGS_KEYS.HA_SENSOR_INVERTER_SOLAR },
  });

  const powerConsumption = await db.systemSetting.findFirst({
    where: { key: SYSTEM_SETTINGS_KEYS.HA_SENSOR_POWER_CONSUMPTION },
  });

  HA_SENSOR_INVERTER_SOLAR = inverter?.stringValue ?? "";
  HA_SENSOR_POWER_CONSUMPTION = powerConsumption?.stringValue ?? "";
};
