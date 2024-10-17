export type ChargingParkSessionType = {
  id: number;
  serialNumber: string;
  connector: number;
  authenticationType?: string;
  rfid?: string;
  userId?: number;
  from: number;
  to?: number;
  status: CHARGING_PARK_SESSION_STATUS;
  suspendedByUser: boolean;
  smartMode: string;
  priority: number;
  minimumExcessPercentage: number;
  maxAmperes: number[];
  startReading: number;
  energy: number;
  stopReading?: number;
};

export enum CHARGING_PARK_SESSION_STATUS {
  INITIAL = "INITIAL",
  STARTED = "STARTED",
  CHARGING = "CHARGING",
  SUSPENDED = "SUSPENDED",
  STOPPING = "STOPPING",
  STOPPED = "STOPPED",
}
