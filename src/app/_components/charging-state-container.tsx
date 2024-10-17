"use client";

import { type inferProcedureOutput } from "@trpc/server";
import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { STATION_CHARGE_STATE } from "~/models/station-charge-state-enum";
import { type AppRouter } from "~/server/api/root";
import { api } from "~/trpc/react";

export const ChargingStateContainer = ({
  session,
}: {
  session?: inferProcedureOutput<
    AppRouter["chargingSessions"]["getLatestSessionFromActiveChargingStation"]
  >;
}) => {
  const activeChargingStationQuery =
    api.chargingSessions.getLatestSessionFromActiveChargingStation.useQuery({
      chargingStationId: session?.chargingStationId ?? "",
    });

  const [currentChargingState, setCurrentChargingState] =
    useState<STATION_CHARGE_STATE>();

  useEffect(() => {
    session?.chargingStateChanges[0]?.state &&
      setCurrentChargingState(
        session?.chargingStateChanges[0]?.state as STATION_CHARGE_STATE,
      );
    const poller = setInterval(() => {
      void refetchChargingState();
    }, 5000);

    const refetchChargingState = async () => {
      const result = await activeChargingStationQuery.refetch();
      if (result.data?.chargingStateChanges[0]?.state)
        setCurrentChargingState(
          result.data?.chargingStateChanges[0]?.state as STATION_CHARGE_STATE,
        );
    };
    return () => clearInterval(poller); // Properly clear the interval on component unmount
  }, [session]);

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Charging state</CardTitle>
        <CardDescription>
          The actual state of your charging station.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {session?.chargingStateChanges[0] && (
          <div className="flex flex-wrap items-center gap-2">
            <MultipleButton
              currentChargingState={currentChargingState}
              buttonState={STATION_CHARGE_STATE.PAUSED}
              title={
                <Image
                  src="/icons/sleeping-panda.png"
                  alt="sleeping panda to represent a sleeping value"
                  width={40}
                  height={40}
                />
              }
            />
            <MultipleButton
              currentChargingState={currentChargingState}
              buttonState={STATION_CHARGE_STATE.SLOW}
              title={
                <Image
                  src="/icons/snail.png"
                  alt="snail to represent a slow value"
                  width={40}
                  height={40}
                />
              }
            />
            <MultipleButton
              currentChargingState={currentChargingState}
              buttonState={STATION_CHARGE_STATE.TURBO}
              title={
                <Image
                  src="/icons/formula-car.png"
                  alt="formula car to represent a fast value"
                  width={40}
                  height={40}
                />
              }
            />
          </div>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-sm italic">
          If this is not the expected state, then check your modes and change
          them to suit your needs.
        </p>
      </CardFooter>
    </Card>
  );
};

const MultipleButton = ({
  currentChargingState,
  buttonState,
  title,
}: {
  currentChargingState: STATION_CHARGE_STATE | undefined;
  buttonState: STATION_CHARGE_STATE;
  title: string | ReactNode;
}) => {
  return (
    <div>
      {currentChargingState === buttonState ? (
        <Button disabled variant="outline" className="bg-primary">
          {title}
        </Button>
      ) : (
        <Button disabled variant="secondary">
          {title}
        </Button>
      )}
    </div>
  );
};
