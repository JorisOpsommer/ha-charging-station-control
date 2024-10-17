import { SYSTEM_SETTINGS_KEYS } from "~/models/system-settings-keys.enum";
import { db } from "~/server/db";
import { logger } from "~/server/utils/logger";
import { type HAEntityState } from "./entity-state-type";

let HA_BASEURL: string;
let HA_TOKEN: string;

export const getEntityState = async (
  entity: string,
): Promise<HAEntityState | undefined> => {
  try {
    if (!HA_BASEURL || !HA_TOKEN) {
      await dbConstants();
    }

    const result = await fetch(`${HA_BASEURL}/states/${entity}`, {
      headers: {
        Authorization: `Bearer ${HA_TOKEN}`,
      },
    });
    if (!result.ok) {
      logger.error(
        `HTTP error! ${HA_BASEURL}/states/${entity}, status: ${result.status}`,
      );
      throw new Error(`HTTP error! status: ${result.status}`);
    }
    return result.json() as Promise<HAEntityState>;
  } catch (error: any) {
    logger.error(
      `HTTP error! ${HA_BASEURL}/states/${entity}, status: ${error?.status}`,
    );
    return undefined;
  }
};

const dbConstants = async () => {
  const baseUrlDb = await db.systemSetting.findFirst({
    where: { key: SYSTEM_SETTINGS_KEYS.HA_BASEURL },
  });
  HA_BASEURL = baseUrlDb?.stringValue ?? "";

  const tokenDb = await db.systemSetting.findFirst({
    where: { key: SYSTEM_SETTINGS_KEYS.HA_TOKEN },
  });
  HA_TOKEN = tokenDb?.stringValue ?? "";
};
