import { z } from "zod";
import { ChargingStationBrands } from "~/models/charging-station-brands-enum";
import { HA_CHARGE_INSTRUCTION } from "~/models/ha-charge-instruction-enum";
import { STATION_CHARGE_STATE } from "~/models/station-charge-state-enum";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const chargingStationsRouter = createTRPCRouter({
  getChargingStations: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.chargingStation.findMany({
      orderBy: [{ isActive: "desc" }, { name: "asc" }],
    });
  }),

  getActiveChargingStation: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.chargingStation.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      include: {
        chargingSessions: { orderBy: { updatedAt: "desc" }, take: 1 },
        chargingStationCredential: true,
      },
    });
  }),

  addChargingStation: publicProcedure
    .input(
      z.object({
        name: z.string().max(32),
        brand: z.nativeEnum(ChargingStationBrands),
        smappeeSerialIdMobileApp: z.string().max(64),
        username: z.string().max(64),
        password: z.string().max(64),
        apiClientId: z.string().max(64),
        apiClientSecret: z.string().max(64),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const hasActiveChargingStation = await ctx.db.chargingStation.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
      });

      await ctx.db.chargingStation.create({
        data: {
          name: input.name,
          isActive: !hasActiveChargingStation,
          brand: input.brand,
          chargingStationCredential: {
            create: {
              username: input.username,
              password: input.password,
              apiClientId: input.apiClientId,
              apiClientSecret: input.apiClientSecret,
              smappeeSerialIdMobileApp: input.smappeeSerialIdMobileApp,
            },
          },
          // Also create a session so we start wit ha valid charge instruction & station charge state
          chargingSessions: {
            create: {
              instructionStateChanges: {
                create: { state: HA_CHARGE_INSTRUCTION.PAUSED },
              },
              chargingStateChanges: {
                create: { state: STATION_CHARGE_STATE.PAUSED },
              },
            },
          },
        },
      });
    }),

  updateActiveChargingStation: publicProcedure
    .input(
      z.object({
        id: z.string().min(2).max(64),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.chargingStation.updateMany({
        data: { isActive: false },
        where: { isActive: true },
      });
      await ctx.db.chargingStation.update({
        data: { isActive: true },
        where: { id: input.id },
      });
    }),
});
