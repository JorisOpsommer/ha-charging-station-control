import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const chargingSpeedsRouter = createTRPCRouter({
  getChargingSpeeds: publicProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number().min(1).max(100).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit = 100 } = input;

      return await ctx.db.chargingSpeed.findMany({
        cursor: cursor ? { id: cursor } : undefined,
        take: limit,
        skip: cursor ? 1 : undefined,
      });
    }),

  updateChargingSpeed: publicProcedure
    .input(
      z.object({
        id: z.string(),
        unit: z.enum(["PERCENTAGE", "AMPERE"]),
        value: z.union([z.string(), z.number().min(6)]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, unit, value } = input;
      const valueTypeIsString = typeof value === "string";

      return await ctx.db.chargingSpeed.update({
        where: { id },
        data: {
          numberValue: valueTypeIsString ? undefined : value,
          stringValue: valueTypeIsString ? value : undefined,
          unit,
        },
      });
    }),
});
