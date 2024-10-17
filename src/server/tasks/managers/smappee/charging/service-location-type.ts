export type ServiceLocationType = {
  appName: string;
  serviceLocations: ServiceLocation[];
};

type ServiceLocation = {
  serviceLocationId: number;
  serviceLocationUuid: string;
  name: string;
  deviceSerialNumber: string;
};
