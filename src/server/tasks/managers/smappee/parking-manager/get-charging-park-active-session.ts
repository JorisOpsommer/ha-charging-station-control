import { SYSTEM_SETTINGS_KEYS } from "~/models/system-settings-keys.enum";
import { db } from "~/server/db";
import { logger } from "~/server/utils/logger";
import { type ChargingParkSessionType } from "./charging-park-session-type";

let SMAPPEE_BASEURL: string;

export const getChargingParkActiveSession = async (
  accessToken: string,
  from: number,
  to: number,
  chargingParkLocationId: number,
): Promise<ChargingParkSessionType | undefined> => {
  try {
    if (!SMAPPEE_BASEURL) await dbConstants();
    const result = await fetch(
      `${SMAPPEE_BASEURL}/chargingparks/${chargingParkLocationId}/sessions?range=${from},${to}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    if (!result.ok) {
      throw new Error(`HTTP error! status: ${result.status}`);
    }

    const chargingParkSessions: ChargingParkSessionType[] = await result.json();
    const lastChargingParkSession = chargingParkSessions?.[0];
    return lastChargingParkSession;
  } catch (error: any) {
    logger.error(
      `HTTP error! for /chargingparks/${chargingParkLocationId} ${error?.status}`,
    );
  }
};

const dbConstants = async () => {
  const smappee_baseurl = await db.systemSetting.findFirst({
    where: { key: SYSTEM_SETTINGS_KEYS.SMAPPEE_BASEURL },
  });
  SMAPPEE_BASEURL = smappee_baseurl?.stringValue ?? "";
};
