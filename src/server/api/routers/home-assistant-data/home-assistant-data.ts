import dayjs from "dayjs";
import { z } from "zod";
import { type STATION_CHARGE_STATE } from "~/models/station-charge-state-enum";
import { createTRPCRouter, publicProcedure } from "../../trpc";
import { fetchData } from "./home-assistant-data-functions";

export enum HOME_ASSISTANT_DATA_TIMEFRAME {
  "1M" = "1m",
  "5M" = "5m",
  "1H" = "1h",
}

type ChargingStateChangeDTO = {
  id: string;
  chargingSessionId: string;
  state: STATION_CHARGE_STATE | string;
  changedAt: Date;
};

type DataIncludeChargingStatesIncludeInstructionStatesDTO = {
  id: string;
  createdAt: Date;
  inverterOutputInWatt: number;
  powerConsumptionInWatt: number;
  chargingStateChange: Partial<ChargingStateChangeDTO>;
};

export const homeAssistantDataRouter = createTRPCRouter({
  data: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional(),
        cursor: z.string().optional(),
        timeframe: z.nativeEnum(HOME_ASSISTANT_DATA_TIMEFRAME),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit = 100, timeframe } = input;
      return await fetchData({ ctx, cursor, limit, timeframe });
    }),

  dataIncludeChargingStatesIncludeInstructionStates: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional(),
        cursor: z.string().optional(),
        timeframe: z.nativeEnum(HOME_ASSISTANT_DATA_TIMEFRAME),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit = 100, timeframe } = input;

      const haDataPoints = await fetchData({ ctx, cursor, limit, timeframe });
      const chargingStates = await ctx.db.chargingStateChange
        .findMany({
          orderBy: { changedAt: "desc" },
          take: 100,
          where: { changedAt: { gt: haDataPoints[0]?.createdAt } },
        })
        .then((x) => x.reverse());
      //todo order by asc and dont reverse

      let chargingStatesIndex = 0;

      let previousState: ChargingStateChangeDTO | undefined | null;
      if (chargingStates.length === 0)
        previousState = await ctx.db.chargingStateChange.findFirst({
          orderBy: { changedAt: "desc" },
        });

      const result: DataIncludeChargingStatesIncludeInstructionStatesDTO[] =
        haDataPoints.map((haDp, index) => {
          while (
            dayjs(chargingStates[chargingStatesIndex]?.changedAt).isBefore(
              haDp?.createdAt,
            )
          ) {
            chargingStatesIndex++;
          }

          const nextHaData = haDataPoints[index + 1];
          if (
            dayjs(nextHaData?.createdAt).isAfter(
              chargingStates[chargingStatesIndex]?.changedAt,
            )
          ) {
            // It could happen that multiple states were in the timespan haDp and nextHaDp, we are only interested in the latest state
            while (
              chargingStates[chargingStatesIndex + 1] &&
              dayjs(
                chargingStates[chargingStatesIndex + 1]?.changedAt,
              ).isBefore(nextHaData?.createdAt)
            ) {
              chargingStatesIndex++;
            }
            if (chargingStates[chargingStatesIndex])
              previousState = chargingStates[chargingStatesIndex];

            return {
              ...haDp,
              chargingStateChange: chargingStates[chargingStatesIndex] as any,
            };
          }
          return { ...haDp, chargingStateChange: previousState };
        });
      return result;
    }),
});
