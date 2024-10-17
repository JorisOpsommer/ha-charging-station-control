import { z } from "zod";
import { SYSTEM_SETTINGS_KEYS } from "~/models/system-settings-keys.enum";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const systemSettingsRouter = createTRPCRouter({
  getSystemSetting: publicProcedure
    .input(z.object({ key: z.string().min(2).max(64) }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.systemSetting.findFirst({
        where: { key: input.key },
      });
    }),

  getChargingSettings: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.systemSetting.findMany({
      where: {
        OR: [
          {
            key: SYSTEM_SETTINGS_KEYS.SLOWCHARGE_CHARGE_CONSUMPTION_THRESHOLD_WATT,
          },
          {
            key: SYSTEM_SETTINGS_KEYS.SLOWCHARGE_PAUSE_CONSUMPTION_THRESHOLD_WATT,
          },
          {
            key: SYSTEM_SETTINGS_KEYS.SUNCHARGE_PAUSE_CONSUMPTION_THRESHOLD_WATT,
          },
          { key: SYSTEM_SETTINGS_KEYS.SUNCHARGE_PAUSE_INVERTER_THRESHOLD_WATT },
          {
            key: SYSTEM_SETTINGS_KEYS.SUNCHARGE_SLOW_CONSUMPTION_THRESHOLD_WATT,
          },
          { key: SYSTEM_SETTINGS_KEYS.SUNCHARGE_SLOW_INVERTER_THRESHOLD_WATT },
        ],
      },
    });
  }),

  getHomeAssistantSettings: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.systemSetting.findMany({
      where: {
        OR: [
          {
            key: SYSTEM_SETTINGS_KEYS.HA_TOKEN,
          },
          {
            key: SYSTEM_SETTINGS_KEYS.HA_BASEURL,
          },
          {
            key: SYSTEM_SETTINGS_KEYS.HA_SENSOR_INVERTER_SOLAR,
          },
          { key: SYSTEM_SETTINGS_KEYS.HA_SENSOR_POWER_CONSUMPTION },
        ],
      },
    });
  }),

  updateSystemSettingByKey: publicProcedure
    .input(
      z.object({
        key: z.string().min(2).max(64),
        numberValue: z.number().optional(),
        stringValue: z.string().min(2).max(512).optional(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updateData: {
        numberValue?: number;
        stringValue?: string;
        description?: string;
      } = {};
      if (input.numberValue !== null)
        updateData.numberValue = input.numberValue;
      if (input.stringValue !== null)
        updateData.stringValue = input.stringValue;
      if (input.description !== null)
        updateData.description = input.description;

      await ctx.db.systemSetting.update({
        where: { key: input.key },
        data: updateData,
      });
    }),
});
