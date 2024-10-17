import { HOME_ASSISTANT_DATA_TIMEFRAME } from "~/server/api/routers/home-assistant-data/home-assistant-data";
import { api } from "~/trpc/server";
import FormattedTimestamp from "../components/custom/formatted-timestamp";
import { ChangeInstructionContainer } from "./_components/change-instruction-container";
import { ChargingStateContainer } from "./_components/charging-state-container";
import { LineChart } from "./_components/line-chart";

export default async function Home() {
  const activeStation = await api.chargingStations.getActiveChargingStation();
  let latestSession;
  if (activeStation) {
    latestSession =
      await api.chargingSessions.getLatestSessionFromActiveChargingStation({
        chargingStationId: activeStation?.id,
      });
  }

  const homeAssistantData_5m =
    await api.homeAssistantData.dataIncludeChargingStatesIncludeInstructionStates(
      {
        timeframe: HOME_ASSISTANT_DATA_TIMEFRAME["5M"],
      },
    );

  const homeAssistantData_1h =
    await api.homeAssistantData.dataIncludeChargingStatesIncludeInstructionStates(
      {
        timeframe: HOME_ASSISTANT_DATA_TIMEFRAME["1H"],
      },
    );

  return (
    <main>
      <h1>{activeStation?.name}</h1>
      <h2>
        {latestSession?.chargingStateChanges[0]?.state} since{" "}
        <FormattedTimestamp
          timestamp={latestSession?.chargingStateChanges[0]?.changedAt ?? null}
          showMinutesAndSeconds
        ></FormattedTimestamp>
      </h2>
      {latestSession && (
        <div className="flex h-max w-full flex-col gap-4 py-4 sm:flex-row">
          <ChangeInstructionContainer session={latestSession} />
          <ChargingStateContainer session={latestSession} />
        </div>
      )}
      <div className="my-4 flex flex-col">
        <div className="w-full  sm:w-4/6">
          <LineChart data={homeAssistantData_5m} />
        </div>
        <div className="w-full sm:w-4/6">
          <LineChart data={homeAssistantData_1h} />
        </div>
      </div>
    </main>
  );
}
