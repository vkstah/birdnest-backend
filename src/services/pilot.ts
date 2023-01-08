import { Pilot } from "../types";

/**
 * Fetch pilot data from the Reaktor pilot endpoint using the serial number.
 *
 * Returns an object containing the pilot data, empty strings if the pilot was not found.
 *
 * @param serialNumber The serial number of the drone.
 */
export const fetchPilot = async (serialNumber: string): Promise<Pilot> => {
  const pilotAPIResponse = await fetch(
    `https://assignments.reaktor.com/birdnest/pilots/${serialNumber}`
  );

  if (!pilotAPIResponse?.ok) {
    console.log(
      `Failed to fetch pilot data with status code ${pilotAPIResponse.status}`
    );
    return {
      pilotId: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      createdDt: "",
      email: "",
    };
  }

  const pilot: Pilot = await pilotAPIResponse.json();
  return pilot;
};
