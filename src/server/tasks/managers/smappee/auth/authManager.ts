import fetch from "node-fetch";
import { SYSTEM_SETTINGS_KEYS } from "~/models/system-settings-keys.enum";
import { db } from "~/server/db";
import { logger } from "~/server/utils/logger";
import { type RefreshTokenSmappee } from "./refresh-token-type";

let accessToken = "";
let expiry = 0;

let API_CLIENT_ID: string;
let API_CLIENT_SECRET: string;
let USERNAME: string;
let PASSWORD: string;
let REFRESH_TOKEN_URL: string;

export const getAccessToken = async () => {
  if (expiry - 1000 < new Date().getTime()) {
    const token = await fetchAccessToken();
    if (token) {
      expiry = new Date().getTime() + Number(token.expires_in) * 1000;
      accessToken = token?.access_token;
      return token?.access_token;
    }
  }
  return accessToken;
};

const dbConstants = async () => {
  const activeChargingStation = await db.chargingStation.findFirst({
    where: { isActive: true },
    include: { chargingStationCredential: true },
  });

  const baseurl = await db.systemSetting.findFirst({
    where: { key: SYSTEM_SETTINGS_KEYS.SMAPPEE_BASEURL },
  });

  API_CLIENT_ID =
    activeChargingStation?.chargingStationCredential?.apiClientId ?? "";
  API_CLIENT_SECRET =
    activeChargingStation?.chargingStationCredential?.apiClientSecret ?? "";
  USERNAME = activeChargingStation?.chargingStationCredential?.username ?? "";
  PASSWORD = activeChargingStation?.chargingStationCredential?.password ?? "";
  REFRESH_TOKEN_URL = `${baseurl?.stringValue}/oauth2/token`;
};

const fetchAccessToken = async (): Promise<RefreshTokenSmappee | undefined> => {
  if (!API_CLIENT_ID || !API_CLIENT_SECRET || !USERNAME || !PASSWORD)
    await dbConstants();

  const formUrlEncoded = new URLSearchParams();
  formUrlEncoded.append("client_id", API_CLIENT_ID);
  formUrlEncoded.append("client_secret", API_CLIENT_SECRET);
  formUrlEncoded.append("username", USERNAME);
  formUrlEncoded.append("password", PASSWORD);
  formUrlEncoded.append("grant_type", "password");

  try {
    const result = await fetch(REFRESH_TOKEN_URL, {
      method: "POST",
      body: formUrlEncoded,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    if (result.ok) {
      return result.json() as Promise<RefreshTokenSmappee>;
    } else {
      logger.error(
        `HTTP error! ${REFRESH_TOKEN_URL} status: ${result?.status}`,
      );
    }
  } catch (error: any) {
    logger.error(`HTTP error! ${REFRESH_TOKEN_URL} status: ${error?.status}`);
  }
};
