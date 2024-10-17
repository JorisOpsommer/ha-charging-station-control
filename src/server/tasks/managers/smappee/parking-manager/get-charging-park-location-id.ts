import fetch from "node-fetch";
import { SYSTEM_SETTINGS_KEYS } from "~/models/system-settings-keys.enum";
import { db } from "~/server/db";
import { logger } from "~/server/utils/logger";
import { type ServiceLocationType } from "../charging/service-location-type";

let SERVICE_LOCATION_ID: number;
let SMAPPEE_BASEURL: string;

export const getChargingParkLocationId = async (accessToken: string) => {
  if (SERVICE_LOCATION_ID) return SERVICE_LOCATION_ID;

  try {
    if (!SMAPPEE_BASEURL) await dbConstants();

    const result = await fetch(SMAPPEE_BASEURL + "/servicelocation", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!result.ok) throw new Error("HTTP failed");

    const serviceLocation: ServiceLocationType = (await result.json()) as any;

    return serviceLocation.serviceLocations[0]?.serviceLocationId;
  } catch (error: any) {
    logger.error(`HTTP error! for /servicelocation ${error?.message}`);
  }
};

const dbConstants = async () => {
  const smappee_baseurl = await db.systemSetting.findFirst({
    where: { key: SYSTEM_SETTINGS_KEYS.SMAPPEE_BASEURL },
  });
  SMAPPEE_BASEURL = smappee_baseurl?.stringValue ?? "";
};
