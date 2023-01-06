export type WebSocketBroadcast = {
  data: any;
  error: string;
};

export type Point = {
  x: number;
  y: number;
};

export type DronesSnaphot = {
  timestamp: string;
  drones: Drone[];
};

export type Drone = {
  serialNumber: string;
  model: string;
  manufacturer: string;
  mac: string;
  ipv4: string;
  ipv6: string;
  firmware: string;
  positionY: number;
  positionX: number;
  altitude: number;
};

export type Pilot = {
  pilotId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  createdDt: string;
  email: string;
};
