import { z } from "zod";
import { HA_CHARGE_INSTRUCTION } from "~/models/ha-charge-instruction-enum";
import { STATION_CHARGE_STATE } from "~/models/station-charge-state-enum";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const chargingSessionsRouter = createTRPCRouter({
  getSessions: publicProcedure
    .input(
      z.object({
        chargingStationId: z.string(),
        cursor: z.string().optional(),
        limit: z.number().min(1).max(100).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { chargingStationId, cursor, limit = 100 } = input;

      return await ctx.db.chargingSession.findMany({
        where: { chargingStationId },
        orderBy: { updatedAt: "desc" },
        include: {
          chargingStateChanges: { orderBy: { changedAt: "desc" }, take: 100 },
          instructionStateChanges: {
            orderBy: { changedAt: "desc" },
            take: 100,
          },
          ChargingStation: true,
        },
        take: limit,
        cursor: cursor ? { id: cursor } : undefined,
        skip: cursor ? 1 : undefined,
      });
    }),

  getLatestSessionFromActiveChargingStation: publicProcedure
    .input(
      z.object({
        chargingStationId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { chargingStationId } = input;

      return await ctx.db.chargingSession.findFirst({
        where: { chargingStationId },
        orderBy: { updatedAt: "desc" },
        include: {
          chargingStateChanges: { orderBy: { changedAt: "desc" } },
          instructionStateChanges: { orderBy: { changedAt: "desc" } },
          ChargingStation: true,
        },
        take: 1,
      });
    }),

  addInstructionState: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
        state: z.nativeEnum(HA_CHARGE_INSTRUCTION),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.instructionStateChange.create({
        data: { state: input.state, chargingSessionId: input.sessionId },
      });
    }),

  addChargingState: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
        state: z.nativeEnum(STATION_CHARGE_STATE),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.chargingStateChange.create({
        data: { state: input.state, chargingSessionId: input.sessionId },
      });
    }),
});
