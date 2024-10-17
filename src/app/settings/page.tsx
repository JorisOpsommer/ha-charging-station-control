import { SystemSettingForm } from "~/components/custom/system-setting-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { SYSTEM_SETTINGS_KEYS } from "~/models/system-settings-keys.enum";
import { api } from "~/trpc/server";

export default async function SettingsPage() {
  const homeAssistantSettings =
    await api.systemSettings.getHomeAssistantSettings();

  const HA_BaseUrl = homeAssistantSettings.find(
    (x) => x.key === SYSTEM_SETTINGS_KEYS.HA_BASEURL,
  );

  const HA_TOKEN = homeAssistantSettings.find(
    (x) => x.key === SYSTEM_SETTINGS_KEYS.HA_TOKEN,
  );

  const HA_SENSOR_INVERTER_SOLAR = homeAssistantSettings.find(
    (x) => x.key === SYSTEM_SETTINGS_KEYS.HA_SENSOR_INVERTER_SOLAR,
  );
  const HA_SENSOR_POWER_CONSUMPTION = homeAssistantSettings.find(
    (x) => x.key === SYSTEM_SETTINGS_KEYS.HA_SENSOR_POWER_CONSUMPTION,
  );

  return (
    <div>
      <h1>Settings page</h1>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Charging instruction</CardTitle>
          <CardDescription>
            Change your instruction by selecting any of the buttons below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col  gap-2">
            {HA_BaseUrl && (
              <SystemSettingForm
                systemSetting={{
                  ...HA_BaseUrl,
                  subDescription: "e.g. http://192.168.0.14:8123/api",
                }}
              />
            )}

            {HA_TOKEN && (
              <SystemSettingForm
                systemSetting={{
                  ...HA_TOKEN,
                  subDescription:
                    "To generate a token in home assistant go to profile and create a long-lived access token.",
                }}
              />
            )}

            {HA_SENSOR_INVERTER_SOLAR && (
              <SystemSettingForm
                systemSetting={{
                  ...HA_SENSOR_INVERTER_SOLAR,
                  subDescription: "e.g. sensor.inverter",
                }}
              />
            )}

            {HA_SENSOR_POWER_CONSUMPTION && (
              <SystemSettingForm
                systemSetting={{
                  ...HA_SENSOR_POWER_CONSUMPTION,
                  subDescription: "e.g. sensor.power_consumed",
                }}
              />
            )}
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm italic">
            These variables can be found in your home assistant.
            <br />
            Note: Your credentials are stored locally on your computer.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
