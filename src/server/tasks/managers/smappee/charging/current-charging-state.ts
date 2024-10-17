import { type ChargingStateChange } from "@prisma/client";
import dayjs from "dayjs";
import { HA_CHARGE_INSTRUCTION } from "~/models/ha-charge-instruction-enum";
import { STATION_CHARGE_STATE } from "~/models/station-charge-state-enum";
import { SYSTEM_SETTINGS_KEYS } from "~/models/system-settings-keys.enum";
import { db } from "~/server/db";
import { logger } from "~/server/utils/logger";
import { getAccessToken } from "../auth/authManager";

const MIN_UPDATE_INTERVAL_IN_MINUTES = 5;
let SMAPPEE_BASEURL: string;
let SMAPPEE_SERIAL_ID_MOBILE_APP: string;
let isLockedChargingState = false;

export const setCurrentChargingState = async ({
  state,
}: {
  state: STATION_CHARGE_STATE;
}) => {
  const currentChargingInstruction = await getCurrentChargingInstructionDb();
  const currentChargingState = await getCurrentChargingState();
  if (currentChargingState?.state !== state) {
    if (canUpdateChargingState(currentChargingState?.changedAt)) {
      const updateResult = await updateChargingMode({
        currentchargingStateChange: currentChargingState,
        newState: state,
        chargingInstruction: currentChargingInstruction,
      });
      if (updateResult) {
        logger.info(
          `updated charging state smappee to ${state} successfully, updating local current charging state`,
        );
      }
    }
  }
};

// In order to start a session at Smappee, the station can not be paused. So if there is no active session we want to force the state to activate charging until a car is connected.
export const forceChargingAndEnableLockedState = async () => {
  const currentChargingState = await getCurrentChargingState();
  logger.info(`setIsLockedChargingState to true`);
  isLockedChargingState = true;
  if (currentChargingState?.state !== STATION_CHARGE_STATE.SLOW) {
    await updateChargingMode({
      currentchargingStateChange: currentChargingState,
      newState: STATION_CHARGE_STATE.SLOW,
      chargingInstruction: HA_CHARGE_INSTRUCTION.SLOW,
    });
  }
};

export const disableLockedState = () => {
  logger.info(`setIsLockedChargingState to false`);
  isLockedChargingState = false;
};

const canUpdateChargingState = (changedAt: Date | undefined): boolean => {
  if (isLockedChargingState) return false;
  if (!changedAt) return true;

  const lastUpdate = dayjs(changedAt);
  if (dayjs().diff(lastUpdate, "minute") >= MIN_UPDATE_INTERVAL_IN_MINUTES)
    return true;
  logger.info(
    `canUpdateChargingState is false because diff in min = ${dayjs().diff(
      lastUpdate,
      "minute",
    )} < ${MIN_UPDATE_INTERVAL_IN_MINUTES}`,
  );
  return false;
};

const updateChargingStateDb = async ({
  chargingSessionId,
  newState,
}: {
  chargingSessionId: string | undefined;
  newState: STATION_CHARGE_STATE;
}) => {
  if (chargingSessionId) {
    try {
      await db.chargingStateChange.create({
        data: {
          chargingSessionId,
          state: newState,
        },
      });
    } catch (error: any) {
      logger.error(
        "Error in current-charging-state,  db.chargingStateChange.create, data: chargingSessionId",
        chargingSessionId,
        "newState",
        newState,
      );
    }
  }
};

export const getCurrentChargingState = async (): Promise<
  ChargingStateChange | undefined
> => {
  // If no session is active this will return undefined.
  const activeChargingStation = await db.chargingStation.findFirst({
    where: { isActive: true },
    include: {
      chargingSessions: {
        orderBy: { startedAt: "desc" },
        where: { endedAt: { equals: null } },
        take: 1,
        include: {
          chargingStateChanges: { orderBy: { changedAt: "desc" }, take: 1 },
        },
      },
    },
  });
  const currentChargingState =
    activeChargingStation?.chargingSessions?.[0]?.chargingStateChanges?.[0];
  if (!currentChargingState) {
    // If no session is active we want to return the latest charging state in database, because a session can be stopped but we might have forced the state to slow charging in order to start a new session at Smappee.
    const latestChargingState = await db.chargingStateChange.findFirst({
      orderBy: { changedAt: "desc" },
    });
    return latestChargingState ?? undefined;
  }
  return currentChargingState;
};

const getCurrentChargingInstructionDb =
  async (): Promise<HA_CHARGE_INSTRUCTION> => {
    const latestInstruction = await db.instructionStateChange.findFirst({
      orderBy: { changedAt: "desc" },
    });
    if (!latestInstruction) return HA_CHARGE_INSTRUCTION.PAUSED;
    return latestInstruction.state as HA_CHARGE_INSTRUCTION;
  };

export const overwriteSmappeeChargingState = async () => {
  const currentState = await getCurrentChargingState();
  const currentChargingInstruction = await getCurrentChargingInstructionDb();
  if (currentState?.state)
    await updateChargingMode({
      currentchargingStateChange: currentState,
      newState: currentState.state as STATION_CHARGE_STATE,
      chargingInstruction: currentChargingInstruction,
    });
};

const updateChargingMode = async ({
  currentchargingStateChange,
  newState,
  chargingInstruction,
}: {
  currentchargingStateChange: ChargingStateChange | undefined;
  newState: STATION_CHARGE_STATE;
  chargingInstruction: HA_CHARGE_INSTRUCTION;
}) => {
  const tokenSmappee = await getAccessToken();
  const body = await getApiSettingsForCharging(newState, chargingInstruction);

  try {
    if (!SMAPPEE_BASEURL || !SMAPPEE_SERIAL_ID_MOBILE_APP) await dbConstants();
    const PUT_CHARGING_MODE_URL = `${SMAPPEE_BASEURL}/chargingstations/${SMAPPEE_SERIAL_ID_MOBILE_APP}/connectors/1/mode`;

    return await fetch(PUT_CHARGING_MODE_URL, {
      method: "PUT",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenSmappee}`,
      },
    }).then(async (result) => {
      if (result.ok) {
        if (
          (currentchargingStateChange?.state as STATION_CHARGE_STATE) !==
          newState
        ) {
          // Only update db if the new state is different from current charging state.
          await updateChargingStateDb({
            chargingSessionId: currentchargingStateChange?.chargingSessionId,
            newState,
          });
        }
        return true;
      } else {
        logger.error(
          `HTTP error! ${PUT_CHARGING_MODE_URL}, status: ${result.status}`,
        );
        throw new Error(`HTTP error! status: ${result.status}`);
      }
    });
  } catch (error: any) {
    logger.error(`HTTP error! UpdateChargingMode, status: ${error?.status}`);
    return;
  }
};

const getApiSettingsForCharging = async (
  chargeSetting: STATION_CHARGE_STATE,
  chargingInstruction: HA_CHARGE_INSTRUCTION,
) => {
  const chargingSpeedSun = await db.chargingSpeed.findFirst({
    where: { name: HA_CHARGE_INSTRUCTION.SUN },
    orderBy: { createdAt: "desc" },
  });
  const chargingSpeedSlow = await db.chargingSpeed.findFirst({
    where: { name: HA_CHARGE_INSTRUCTION.SLOW },
    orderBy: { createdAt: "desc" },
  });

  const chargingSpeedTurbo = await db.chargingSpeed.findFirst({
    where: { name: HA_CHARGE_INSTRUCTION.TURBO },
    orderBy: { createdAt: "desc" },
  });

  const getLimit = (speed: any) => ({
    unit: speed?.unit,
    value: speed?.stringValue ?? speed?.numberValue,
  });

  switch (chargeSetting) {
    case STATION_CHARGE_STATE.PAUSED:
      return { mode: "PAUSED" };
    case STATION_CHARGE_STATE.SLOW:
      const slowSpeed =
        chargingInstruction === HA_CHARGE_INSTRUCTION.SUN
          ? chargingSpeedSun
          : chargingSpeedSlow;
      return {
        mode: "NORMAL",
        limit: getLimit(slowSpeed),
      };
    case STATION_CHARGE_STATE.TURBO:
      return {
        mode: "NORMAL",
        limit: getLimit(chargingSpeedTurbo),
      };
  }
};

const dbConstants = async () => {
  const activeStation = await db.chargingStation.findFirst({
    where: { isActive: true },
    include: { chargingStationCredential: true },
  });
  SMAPPEE_SERIAL_ID_MOBILE_APP =
    activeStation?.chargingStationCredential?.smappeeSerialIdMobileApp ?? "";

  const smappeeBaseurl = await db.systemSetting.findFirst({
    where: { key: SYSTEM_SETTINGS_KEYS.SMAPPEE_BASEURL },
  });
  SMAPPEE_BASEURL = smappeeBaseurl?.stringValue ?? "";
};
