import { PrismaClient } from "@prisma/client";
import { HA_CHARGE_INSTRUCTION } from "~/models/ha-charge-instruction-enum";
import { STATION_CHARGE_STATE } from "~/models/station-charge-state-enum";
import { SYSTEM_SETTINGS_KEYS } from "~/models/system-settings-keys.enum";

const prisma = new PrismaClient();

const SMAPPEE_BASEURL = "https://app1pub.smappee.net/dev/v3";

const CHARGING_STATION_NAME_DUMMY1 = process.env.CHARGING_STATION_NAME_DUMMY1;
const CHARGING_STATION_BRAND_DUMMY1 = process.env.CHARGING_STATION_BRAND_DUMMY1;
const CHARGING_STATION_CREDENTIAL_USERNAME_DUMMY1 =
  process.env.CHARGING_STATION_CREDENTIAL_USERNAME_DUMMY1;
const CHARGING_STATION_CREDENTIAL_PASSWORD_DUMMY1 =
  process.env.CHARGING_STATION_CREDENTIAL_PASSWORD_DUMMY1;
const CHARGING_STATION_CREDENTIAL_API_CLIENT_ID_DUMMY1 =
  process.env.CHARGING_STATION_CREDENTIAL_API_CLIENT_ID_DUMMY1;
const CHARGING_STATION_CREDENTIAL_API_CLIENT_SECRET_DUMMY1 =
  process.env.CHARGING_STATION_CREDENTIAL_API_CLIENT_SECRET_DUMMY1;
const CHARGING_STATION_SMAPPEE_SERIALID_MOBILE_APP_DUMMY1 =
  process.env.CHARGING_STATION_SMAPPEE_SERIALID_MOBILE_APP_DUMMY1;

const seed = async () => {
  if (
    CHARGING_STATION_BRAND_DUMMY1 &&
    CHARGING_STATION_CREDENTIAL_USERNAME_DUMMY1 &&
    CHARGING_STATION_CREDENTIAL_PASSWORD_DUMMY1 &&
    CHARGING_STATION_CREDENTIAL_API_CLIENT_ID_DUMMY1 &&
    CHARGING_STATION_CREDENTIAL_API_CLIENT_SECRET_DUMMY1 &&
    CHARGING_STATION_SMAPPEE_SERIALID_MOBILE_APP_DUMMY1
  ) {
    const DEV_station = await prisma.chargingStation.create({
      data: {
        name: CHARGING_STATION_NAME_DUMMY1 ?? "dummy1-charging-station",
        isActive: true,
        brand: CHARGING_STATION_BRAND_DUMMY1,
        chargingStationCredential: {
          create: {
            username: CHARGING_STATION_CREDENTIAL_USERNAME_DUMMY1,
            password: CHARGING_STATION_CREDENTIAL_PASSWORD_DUMMY1,
            apiClientId: CHARGING_STATION_CREDENTIAL_API_CLIENT_ID_DUMMY1,
            apiClientSecret:
              CHARGING_STATION_CREDENTIAL_API_CLIENT_SECRET_DUMMY1,
            smappeeSerialIdMobileApp:
              CHARGING_STATION_SMAPPEE_SERIALID_MOBILE_APP_DUMMY1,
          },
        },
      },
    });

    // Seed ChargingSession for the created station
    const DEV_Session = await prisma.chargingSession.create({
      data: {
        chargingStationId: DEV_station.id,
        instructionStateChanges: {
          create: [{ state: HA_CHARGE_INSTRUCTION.PAUSED }],
        },
        chargingStateChanges: {
          create: [
            { state: STATION_CHARGE_STATE.PAUSED, changedAt: new Date() },
          ],
        },
      },
    });

    // const station2 = await prisma.chargingStation.create({
    //   data: {
    //     name: "dummy2-charging-station",
    //     isActive: false,
    //     brand: ChargingStationBrands.SMAPPEE,
    //   },
    // });

    // const station3 = await prisma.chargingStation.create({
    //   data: {
    //     name: "dummy3-charging-station",
    //     isActive: false,
    //     brand: ChargingStationBrands.SMAPPEE,
    //   },
    // });
  }

  //system settings
  const systemSettingsChargingModes = async () => {
    const slowcharge_charge_consumption_threshold_watt = 800;
    const slowcharge_pause_consumption_threshold_watt = 4800;
    const suncharge_slow_consumption_threshold_watt = 300;
    const suncharge_slow_inverter_threshold_watt = 1100;
    const suncharge_pause_consumption_threshold_watt = 4000;
    const suncharge_pause_inverter_threshold_watt = 900;

    await prisma.systemSetting.create({
      data: {
        key: SYSTEM_SETTINGS_KEYS.SLOWCHARGE_CHARGE_CONSUMPTION_THRESHOLD_WATT,
        description:
          "Start charging if your consumption goes below this value.",
        numberValue: slowcharge_charge_consumption_threshold_watt,
      },
    });

    await prisma.systemSetting.create({
      data: {
        key: SYSTEM_SETTINGS_KEYS.SLOWCHARGE_PAUSE_CONSUMPTION_THRESHOLD_WATT,
        description:
          "Pause charging if your consumption goes above this value.",
        numberValue: slowcharge_pause_consumption_threshold_watt,
      },
    });

    await prisma.systemSetting.create({
      data: {
        key: SYSTEM_SETTINGS_KEYS.SUNCHARGE_SLOW_CONSUMPTION_THRESHOLD_WATT,
        description:
          "Start charging if your consumption goes below this value.",
        numberValue: suncharge_slow_consumption_threshold_watt,
      },
    });

    await prisma.systemSetting.create({
      data: {
        key: SYSTEM_SETTINGS_KEYS.SUNCHARGE_SLOW_INVERTER_THRESHOLD_WATT,
        description:
          "Start charging if your inverter generates more than this value.",
        numberValue: suncharge_slow_inverter_threshold_watt,
      },
    });

    await prisma.systemSetting.create({
      data: {
        key: SYSTEM_SETTINGS_KEYS.SUNCHARGE_PAUSE_CONSUMPTION_THRESHOLD_WATT,
        description:
          "Pause charging if your consumption goes above this value.",
        numberValue: suncharge_pause_consumption_threshold_watt,
      },
    });

    await prisma.systemSetting.create({
      data: {
        key: SYSTEM_SETTINGS_KEYS.SUNCHARGE_PAUSE_INVERTER_THRESHOLD_WATT,
        description:
          "Pause charging if your inverter generates less than this value.",
        numberValue: suncharge_pause_inverter_threshold_watt,
      },
    });
  };

  await systemSettingsChargingModes();

  const systemSettingsHomeAssistant = async () => {
    await prisma.systemSetting.create({
      data: {
        key: SYSTEM_SETTINGS_KEYS.HA_BASEURL,
        description: "Home assistant base url",
        stringValue: process.env.HA_BASEURL ?? "",
      },
    });

    await prisma.systemSetting.create({
      data: {
        key: SYSTEM_SETTINGS_KEYS.HA_TOKEN,
        description: "Home assistant access token",
        stringValue: process.env.HA_TOKEN ?? "",
      },
    });

    await prisma.systemSetting.create({
      data: {
        key: SYSTEM_SETTINGS_KEYS.HA_SENSOR_INVERTER_SOLAR,
        description: "Home assistant inverter sensor",
        stringValue: process.env.HA_SENSOR_INVERTER_SOLAR ?? "",
      },
    });

    await prisma.systemSetting.create({
      data: {
        key: SYSTEM_SETTINGS_KEYS.HA_SENSOR_POWER_CONSUMPTION,
        description: "Home assistant power consumption sensor",
        stringValue: process.env.HA_SENSOR_POWER_CONSUMPTION ?? "",
      },
    });
  };

  await systemSettingsHomeAssistant();

  const systemSettingsBaseUrls = async () => {
    await prisma.systemSetting.create({
      data: {
        key: SYSTEM_SETTINGS_KEYS.SMAPPEE_BASEURL,
        description: "Smappee base url",
        stringValue: SMAPPEE_BASEURL,
      },
    });
  };

  await systemSettingsBaseUrls();

  await prisma.$disconnect();
  console.log("done seeding. Some ids we generated:");
};

const seedChargingSpeeds = async () => {
  await prisma.chargingSpeed.create({
    data: { name: HA_CHARGE_INSTRUCTION.SLOW, unit: "AMPERE", numberValue: 6 },
  });
  await prisma.chargingSpeed.create({
    data: { name: HA_CHARGE_INSTRUCTION.SUN, unit: "AMPERE", numberValue: 6 },
  });
  await prisma.chargingSpeed.create({
    data: {
      name: HA_CHARGE_INSTRUCTION.TURBO,
      unit: "PERCENTAGE",
      numberValue: 100,
    },
  });
};

const main = async () => {
  //check some keys, if any is missing in db, then we want to seed it.
  const ha_baseurl = await prisma.systemSetting.findFirst({
    where: { key: SYSTEM_SETTINGS_KEYS.HA_BASEURL },
  });
  const ha_token = await prisma.systemSetting.findFirst({
    where: { key: SYSTEM_SETTINGS_KEYS.HA_TOKEN },
  });
  const slowcharge = await prisma.systemSetting.findFirst({
    where: {
      key: SYSTEM_SETTINGS_KEYS.SLOWCHARGE_CHARGE_CONSUMPTION_THRESHOLD_WATT,
    },
  });
  const suncharge = await prisma.systemSetting.findFirst({
    where: {
      key: SYSTEM_SETTINGS_KEYS.SUNCHARGE_PAUSE_CONSUMPTION_THRESHOLD_WATT,
    },
  });

  const slowChargingSpeed = await prisma.chargingSpeed.findFirst({
    where: { name: HA_CHARGE_INSTRUCTION.SLOW },
  });
  const sunChargingSpeed = await prisma.chargingSpeed.findFirst({
    where: { name: HA_CHARGE_INSTRUCTION.SLOW },
  });
  const turbo = await prisma.chargingSpeed.findFirst({
    where: { name: HA_CHARGE_INSTRUCTION.TURBO },
  });

  if (!ha_baseurl || !ha_token || !slowcharge || !suncharge) {
    await seed();
  }
  if (!slowChargingSpeed || !sunChargingSpeed || !turbo) {
    await seedChargingSpeeds();
  }
};
await main();
