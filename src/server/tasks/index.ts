import cron from "node-cron";
import { ChargingStationBrands } from "~/models/charging-station-brands-enum";
import { db } from "../db";
import { jobManager } from "./managers/cron-job-manager";
import { fetchHomeAssistantData } from "./managers/home-assistant/home-assistant-manager";
import { smappeeManager } from "./managers/smappee/smappee-manager";

let activeBrand: string;

export const index = async () => {
  cron.schedule("0 * * * * *", () => {
    void defineActiveManagerByBrand();
    void fetchHomeAssistantData();
  });
};

const defineActiveManagerByBrand = async () => {
  const activeStation = await db.chargingStation.findFirst({
    where: { isActive: true },
  });

  if (activeBrand !== activeStation?.brand && activeStation?.brand) {
    //new active charging station brand detected
    activeBrand = activeStation.brand;
    jobManager.stopAllJobs();

    switch (activeStation.brand as ChargingStationBrands) {
      case ChargingStationBrands.SMAPPEE:
        await smappeeManager();
        break;
    }
  }
};

await index();
