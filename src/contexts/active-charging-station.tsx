"use client";

import { type ChargingStation } from "@prisma/client";
import { createContext, useEffect, useState, type ReactNode } from "react";
import { api } from "~/trpc/react";

export const ActiveChargingStationContext = createContext<{
  activeChargingStation: ChargingStation | undefined;
  setActiveChargingStation: (
    chargingStation: ChargingStation | undefined,
  ) => void;
}>({
  activeChargingStation: undefined,
  setActiveChargingStation: () => {
    throw "setActiveChargingStation not implemented";
  },
});

export const ActiveChargingStationHandler = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [activeStation, setActiveStation] = useState<ChargingStation>(
    {} as ChargingStation,
  );
  const result = api.chargingStations.getActiveChargingStation.useQuery();
  useEffect(() => {
    result.data && setActiveStation(result.data);
  }, [result.data]);
  return (
    <ActiveChargingStationContext.Provider
      value={{
        activeChargingStation: activeStation,
        setActiveChargingStation: (station) =>
          station && setActiveStation(station),
      }}
    >
      {children}
    </ActiveChargingStationContext.Provider>
  );
};
