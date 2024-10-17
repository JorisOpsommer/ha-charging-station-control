import { type PrismaClient } from "@prisma/client";
import dayjs from "~/utils/dayjs";
import { HOME_ASSISTANT_DATA_TIMEFRAME } from "./home-assistant-data";

export const fetchData = async ({
  ctx,
  cursor,
  limit = 100,
  timeframe,
}: {
  ctx: { db: PrismaClient };
  cursor?: string;
  limit: number;
  timeframe: HOME_ASSISTANT_DATA_TIMEFRAME;
}) => {
  let adjustedLimit = 0;
  switch (timeframe) {
    case HOME_ASSISTANT_DATA_TIMEFRAME["1M"]:
      adjustedLimit = limit;
      break;

    case HOME_ASSISTANT_DATA_TIMEFRAME["5M"]:
      adjustedLimit = limit * 5;
      break;

    case HOME_ASSISTANT_DATA_TIMEFRAME["1H"]:
      adjustedLimit = limit * 60;
      break;
  }
  const result = await ctx.db.homeAssistantData
    .findMany({
      orderBy: { createdAt: "desc" },
      take: adjustedLimit,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : undefined,
    })
    .then((x) => x.reverse());

  switch (timeframe) {
    case HOME_ASSISTANT_DATA_TIMEFRAME["1M"]:
      return result;

    case HOME_ASSISTANT_DATA_TIMEFRAME["5M"]:
      return result.filter(
        (dataPoint) =>
          dayjs(dataPoint.createdAt).utc().local().minute() % 5 === 0,
      );

    case HOME_ASSISTANT_DATA_TIMEFRAME["1H"]:
      return result.filter(
        (dataPoint) => dayjs(dataPoint.createdAt).utc().local().minute() === 0,
      );
  }
};
