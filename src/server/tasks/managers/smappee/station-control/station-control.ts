import { HA_CHARGE_INSTRUCTION } from "~/models/ha-charge-instruction-enum";
import { STATION_CHARGE_STATE } from "~/models/station-charge-state-enum";
import { SYSTEM_SETTINGS_KEYS } from "~/models/system-settings-keys.enum";
import { db } from "~/server/db";
import { logger } from "~/server/utils/logger";
import { setCurrentChargingState } from "../charging/current-charging-state";

export const stationControl = async ({
  sensorPowerConsumedInWatt,
  sensorInverterSolarInWatt,
  currentChargingState,
  currentChargeInstruction,
}: {
  sensorPowerConsumedInWatt: number;
  sensorInverterSolarInWatt: number;
  currentChargingState: STATION_CHARGE_STATE;
  currentChargeInstruction: HA_CHARGE_INSTRUCTION;
}) => {
  logger.info({
    sensorPowerConsumedInWatt,
    sensorInverterSolarInWatt,
    currentChargingState,
    currentChargeInstruction,
  });
  switch (currentChargeInstruction) {
    case HA_CHARGE_INSTRUCTION.SLOW:
      await decisionSlowCharge({
        currentChargingState,
        sensorPowerConsumedInWatt,
      });
      break;
    case HA_CHARGE_INSTRUCTION.SUN:
      await decissionSunCharge({
        sensorPowerConsumedInWatt,
        sensorInverterSolarInWatt,
        currentChargingState,
      });
      break;
    case HA_CHARGE_INSTRUCTION.TURBO:
      await decissionTurboCharge(currentChargingState);
      break;

    case HA_CHARGE_INSTRUCTION.PAUSED:
      await decissionPausedCharge(currentChargingState);
      break;
  }
};

const decisionSlowCharge = async ({
  sensorPowerConsumedInWatt,
  currentChargingState,
}: {
  sensorPowerConsumedInWatt: number;
  currentChargingState: STATION_CHARGE_STATE;
}) => {
  const slowchargeChargeConsumptionThresholdWatt =
    await db.systemSetting.findFirst({
      where: {
        key: SYSTEM_SETTINGS_KEYS.SLOWCHARGE_CHARGE_CONSUMPTION_THRESHOLD_WATT,
      },
    });

  const slowchargePauseConsumptionThresholdWatt =
    await db.systemSetting.findFirst({
      where: {
        key: SYSTEM_SETTINGS_KEYS.SLOWCHARGE_PAUSE_CONSUMPTION_THRESHOLD_WATT,
      },
    });

  const chargeTrigger =
    slowchargeChargeConsumptionThresholdWatt?.numberValue ?? 0;

  const pauseTrigger =
    slowchargePauseConsumptionThresholdWatt?.numberValue ?? 0;

  if (currentChargingState === STATION_CHARGE_STATE.PAUSED) {
    if (sensorPowerConsumedInWatt < chargeTrigger) {
      await setCurrentChargingState({ state: STATION_CHARGE_STATE.SLOW });
    }
  } else if (currentChargingState === STATION_CHARGE_STATE.SLOW) {
    if (sensorPowerConsumedInWatt > pauseTrigger) {
      await setCurrentChargingState({ state: STATION_CHARGE_STATE.PAUSED });
    }
  }

  if (currentChargingState === STATION_CHARGE_STATE.TURBO)
    await setCurrentChargingState({ state: STATION_CHARGE_STATE.PAUSED });
};

const decissionSunCharge = async ({
  sensorPowerConsumedInWatt,
  sensorInverterSolarInWatt,
  currentChargingState,
}: {
  sensorPowerConsumedInWatt: number;
  sensorInverterSolarInWatt: number;
  currentChargingState: STATION_CHARGE_STATE;
}) => {
  SYSTEM_SETTINGS_KEYS.SUNCHARGE_PAUSE_CONSUMPTION_THRESHOLD_WATT;
  SYSTEM_SETTINGS_KEYS.SUNCHARGE_PAUSE_INVERTER_THRESHOLD_WATT;
  SYSTEM_SETTINGS_KEYS.SUNCHARGE_SLOW_CONSUMPTION_THRESHOLD_WATT;
  SYSTEM_SETTINGS_KEYS.SUNCHARGE_SLOW_INVERTER_THRESHOLD_WATT;

  const sunchargePauseConsumptionThresholdWatt =
    await db.systemSetting.findFirst({
      where: {
        key: SYSTEM_SETTINGS_KEYS.SUNCHARGE_PAUSE_CONSUMPTION_THRESHOLD_WATT,
      },
    });

  const sunchargePauseInverterThresholdWatt = await db.systemSetting.findFirst({
    where: {
      key: SYSTEM_SETTINGS_KEYS.SUNCHARGE_PAUSE_INVERTER_THRESHOLD_WATT,
    },
  });

  const sunchargeSlowConsumptionThresholdWatt =
    await db.systemSetting.findFirst({
      where: {
        key: SYSTEM_SETTINGS_KEYS.SUNCHARGE_SLOW_CONSUMPTION_THRESHOLD_WATT,
      },
    });

  const sunchargeSlowInverterThresholdWatt = await db.systemSetting.findFirst({
    where: {
      key: SYSTEM_SETTINGS_KEYS.SUNCHARGE_SLOW_INVERTER_THRESHOLD_WATT,
    },
  });

  const pauseConsumptionTrigger =
    sunchargePauseConsumptionThresholdWatt?.numberValue ?? 0;

  const pauseInverterTrigger =
    sunchargePauseInverterThresholdWatt?.numberValue ?? 0;

  const chargeConsumptionTrigger =
    sunchargeSlowConsumptionThresholdWatt?.numberValue ?? 0;

  const chargeInverterTrigger =
    sunchargeSlowInverterThresholdWatt?.numberValue ?? 0;

  if (currentChargingState === STATION_CHARGE_STATE.PAUSED) {
    if (
      sensorPowerConsumedInWatt < chargeConsumptionTrigger &&
      sensorInverterSolarInWatt > chargeInverterTrigger
    ) {
      await setCurrentChargingState({ state: STATION_CHARGE_STATE.SLOW });
    }
  }

  if (currentChargingState === STATION_CHARGE_STATE.SLOW) {
    if (
      sensorPowerConsumedInWatt > pauseConsumptionTrigger ||
      sensorInverterSolarInWatt < pauseInverterTrigger
    ) {
      await setCurrentChargingState({ state: STATION_CHARGE_STATE.PAUSED });
    }
  }

  if (currentChargingState === STATION_CHARGE_STATE.TURBO)
    await setCurrentChargingState({ state: STATION_CHARGE_STATE.PAUSED });
};

const decissionTurboCharge = async (
  currentChargingState: STATION_CHARGE_STATE,
) => {
  if (currentChargingState !== STATION_CHARGE_STATE.TURBO) {
    await setCurrentChargingState({ state: STATION_CHARGE_STATE.TURBO });
  }
};

const decissionPausedCharge = async (
  currentChargingState: STATION_CHARGE_STATE,
) => {
  if (currentChargingState !== STATION_CHARGE_STATE.PAUSED)
    await setCurrentChargingState({ state: STATION_CHARGE_STATE.PAUSED });
};
