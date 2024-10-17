import dayjs from "dayjs";
import { HA_CHARGE_INSTRUCTION } from "~/models/ha-charge-instruction-enum";
import { STATION_CHARGE_STATE } from "~/models/station-charge-state-enum";
import { db } from "~/server/db";
import { logger } from "~/server/utils/logger";
import { getAccessToken } from "../auth/authManager";
import {
  disableLockedState,
  forceChargingAndEnableLockedState,
} from "../charging/current-charging-state";
import {
  CHARGING_PARK_SESSION_STATUS,
  type ChargingParkSessionType,
} from "./charging-park-session-type";
import { getChargingParkActiveSession } from "./get-charging-park-active-session";
import { getChargingParkLocationId } from "./get-charging-park-location-id";

export const handleParkingSessions = async () => {
  const lastWeek = dayjs().subtract(1, "week").valueOf();
  const tomorrow = dayjs().add(1, "day").valueOf();

  const accessTokenSmappee = await getAccessToken();
  const chargingParkLocationId =
    await getChargingParkLocationId(accessTokenSmappee);

  if (chargingParkLocationId) {
    const session = await getChargingParkActiveSession(
      accessTokenSmappee,
      lastWeek,
      tomorrow,
      chargingParkLocationId,
    );
    if (session) await sessionManager({ session });
  }
};

//when no car is charging we want to put the session to active so we can badge properly.
const sessionManager = async ({
  session,
}: {
  session: ChargingParkSessionType;
}) => {
  //discard if session is empty.
  if (!session?.status) return;

  let isSessionActive = false;
  switch (session.status) {
    case CHARGING_PARK_SESSION_STATUS.CHARGING:
    case CHARGING_PARK_SESSION_STATUS.INITIAL:
    case CHARGING_PARK_SESSION_STATUS.STARTED:
    case CHARGING_PARK_SESSION_STATUS.SUSPENDED:
      await createNewSession();
      isSessionActive = true;
      break;

    case CHARGING_PARK_SESSION_STATUS.STOPPED:
    case CHARGING_PARK_SESSION_STATUS.STOPPING:
      await markSessionAsEnded();
      isSessionActive = false;
      break;
  }
  if (isSessionActive) {
    disableLockedState();
  } else {
    // session inactive
    // force locked state and set state to charging so we can start a new session at Smappee
    await forceChargingAndEnableLockedState();
  }
};

const createNewSession = async () => {
  const activeChargingStation = await db.chargingStation.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    include: {
      chargingSessions: {
        orderBy: { updatedAt: "desc" },
        take: 1,
        include: {
          instructionStateChanges: { orderBy: { changedAt: "desc" }, take: 1 },
          chargingStateChanges: { orderBy: { changedAt: "desc" }, take: 1 },
        },
      },
    },
  });
  const lastSession = activeChargingStation?.chargingSessions[0];

  if (lastSession && activeChargingStation && lastSession.endedAt) {
    try {
      await db.chargingSession.create({
        data: {
          chargingStationId: activeChargingStation?.id,
          instructionStateChanges: {
            create: {
              state:
                lastSession.instructionStateChanges[0]?.state ??
                (await getLatestInstructionStateChangeInDb()),
            },
          },
          chargingStateChanges: {
            create: {
              state:
                lastSession.chargingStateChanges[0]?.state ??
                (await getLatestChargingStateChangeInDb()),
            },
          },
        },
      });
    } catch (error: any) {
      logger.error(
        "Error in parking-manager, db.chargingSession.create, activeChargingStation",
        activeChargingStation,
        "lastSession",
        lastSession,
      );
    }
  }
};

const getLatestInstructionStateChangeInDb = async () => {
  const latestInstruction = await db.instructionStateChange.findFirst({
    orderBy: { changedAt: "desc" },
  });
  if (!latestInstruction) return HA_CHARGE_INSTRUCTION.PAUSED;
  return latestInstruction.state;
};

const getLatestChargingStateChangeInDb = async () => {
  const latestChargingState = await db.chargingStateChange.findFirst({
    orderBy: { changedAt: "desc" },
  });
  if (!latestChargingState) return STATION_CHARGE_STATE.PAUSED;
  return latestChargingState.state;
};

const markSessionAsEnded = async () => {
  const activeChargingStation = await db.chargingStation.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    include: {
      chargingSessions: {
        orderBy: { updatedAt: "desc" },
        take: 1,
      },
    },
  });

  const lastSession = activeChargingStation?.chargingSessions[0];
  if (lastSession && !lastSession?.endedAt) {
    try {
      await db.chargingSession.update({
        where: { id: lastSession?.id },
        data: { endedAt: new Date() },
      });
    } catch (error: any) {
      logger.error(
        "Error in parking-manager,markSessionAsEnded, lastSession",
        lastSession,
      );
    }
  }
};
