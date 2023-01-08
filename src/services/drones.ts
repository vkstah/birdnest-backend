import { Drone, DronesSnaphot } from "../types/";
import { parseXML } from "../utils/";

/**
 * Fetch drones from the Reaktor drones endpoint.
 * @returns Object containing the drones, snapshot timestamp and a string representing an error (if any).
 */
export const fetchDrones = async (): Promise<DronesSnaphot> => {
  const dronesAPIResponse = await fetch(
    "https://assignments.reaktor.com/birdnest/drones"
  );

  let error = "";
  if (!dronesAPIResponse?.ok) {
    console.log(
      `Failed to fetch drone data with status code ${dronesAPIResponse.status}`
    );
    error = `Failed to fetch drone data with status code ${dronesAPIResponse.status}`;
  }

  const xml = await dronesAPIResponse.text();
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
    error,
  };
};
