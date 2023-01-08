export type WebSocketBroadcast = {
  data: {
    dronesSnapshot: DronesSnaphot;
  };
};

export type Point = {
  x: number;
  y: number;
};

export type DronesSnaphot = {
  timestamp: string;
  drones: Drone[];
  error: string;
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
