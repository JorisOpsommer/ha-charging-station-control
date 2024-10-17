import { LightningBoltIcon, SunIcon } from "@radix-ui/react-icons";
import { Badge } from "~/components/ui/badge";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { SYSTEM_SETTINGS_KEYS } from "~/models/system-settings-keys.enum";
import { api } from "~/trpc/server";
import Paper from "../../../components/custom/paper";
import { SystemSettingForm } from "../../../components/custom/system-setting-form";

export default async function Modes() {
  const charging_system_settings =
    await api.systemSettings.getChargingSettings();
  const suncharge_slow_consumption_threshold_watt =
    charging_system_settings.find(
      (x) =>
        x.key ===
        SYSTEM_SETTINGS_KEYS.SUNCHARGE_SLOW_CONSUMPTION_THRESHOLD_WATT,
    );

  const suncharge_slow_inverter_threshold_watt = charging_system_settings.find(
    (x) =>
      x.key === SYSTEM_SETTINGS_KEYS.SUNCHARGE_SLOW_INVERTER_THRESHOLD_WATT,
  );

  const suncharge_pause_consumption_threshold_watt =
    charging_system_settings.find(
      (x) =>
        x.key ===
        SYSTEM_SETTINGS_KEYS.SUNCHARGE_PAUSE_CONSUMPTION_THRESHOLD_WATT,
    );

  const suncharge_pause_inverter_threshold_watt = charging_system_settings.find(
    (x) =>
      x.key === SYSTEM_SETTINGS_KEYS.SUNCHARGE_PAUSE_INVERTER_THRESHOLD_WATT,
  );

  const slowcharge_charge_consumption_threshold_watt =
    charging_system_settings.find(
      (x) =>
        x.key ===
        SYSTEM_SETTINGS_KEYS.SLOWCHARGE_CHARGE_CONSUMPTION_THRESHOLD_WATT,
    );

  const slowcharge_pause_consumption_threshold_watt =
    charging_system_settings.find(
      (x) =>
        x.key ===
        SYSTEM_SETTINGS_KEYS.SLOWCHARGE_PAUSE_CONSUMPTION_THRESHOLD_WATT,
    );

  return (
    <div>
      <Paper
        title={
          <div className="flex items-center gap-2">
            SUN CHARGING <SunIcon color="yellow" />
          </div>
        }
        styles="max-w-screen-lg"
      >
        <Label>START CHARGING</Label>
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-8">
          <div>
            {suncharge_slow_consumption_threshold_watt && (
              <SystemSettingForm
                systemSetting={{
                  ...suncharge_slow_consumption_threshold_watt,
                  subDescription: "In Watt.",
                }}
              />
            )}
          </div>
          <Badge>AND</Badge>
          <div>
            {suncharge_slow_inverter_threshold_watt && (
              <SystemSettingForm
                systemSetting={{
                  ...suncharge_slow_inverter_threshold_watt,
                  subDescription: "In Watt.",
                }}
              />
            )}
          </div>
        </div>
        <Separator className="my-4" />
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-8">
          <div>
            <Label>PAUSE CHARGING</Label>
            {suncharge_pause_consumption_threshold_watt && (
              <SystemSettingForm
                systemSetting={{
                  ...suncharge_pause_consumption_threshold_watt,
                  subDescription: "In Watt.",
                }}
              />
            )}
          </div>
          <Badge>OR</Badge>
          <div>
            {suncharge_pause_inverter_threshold_watt && (
              <SystemSettingForm
                systemSetting={{
                  ...suncharge_pause_inverter_threshold_watt,
                  subDescription: "In Watt.",
                }}
              />
            )}
          </div>
        </div>
      </Paper>

      <div className="py-4">
        <Paper
          title={
            <div className="flex items-center gap-2">
              SLOW CHARGING <LightningBoltIcon color="yellow" />
            </div>
          }
          styles="max-w-screen-lg"
        >
          <Label>START CHARGING</Label>
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-8">
            <div>
              {slowcharge_charge_consumption_threshold_watt && (
                <SystemSettingForm
                  systemSetting={{
                    ...slowcharge_charge_consumption_threshold_watt,
                    subDescription: "In Watt.",
                  }}
                />
              )}
            </div>
          </div>
          <Separator className="my-4" />
          <Label>PAUSE CHARGING</Label>
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-8">
            <div>
              {slowcharge_pause_consumption_threshold_watt && (
                <SystemSettingForm
                  systemSetting={{
                    ...slowcharge_pause_consumption_threshold_watt,
                    subDescription: "In Watt.",
                  }}
                />
              )}
            </div>
          </div>
        </Paper>
      </div>
    </div>
  );
}
