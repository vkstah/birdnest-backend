import { Drone, DronesSnaphot } from "../types";
import { parseXML } from "../utils";

/**
 * Fetch drones from the Reaktor drones endpoint.
 * @returns Object containing the drones and a timestamp.
 */
export const fetchDrones = async (): Promise<DronesSnaphot> => {
  const dronesAPIResponse = await fetch(
    "https://assignments.reaktor.com/birdnest/drones"
  );
  const xml = await dronesAPIResponse.text();

  if (!xml || dronesAPIResponse.status !== 200) {
    throw new Error("Failed to fetch drone data.");
  }

  const parsedDroneData = parseXML({ xml });
  const timestamp: string =
    parsedDroneData.report.capture["@_snapshotTimestamp"];
  const drones: Drone[] = parsedDroneData.report.capture.drone.map(
    (drone: Drone) => {
      return drone;
    }
  );

  return {
    timestamp,
    drones,
  };
};
