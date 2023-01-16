import { XMLParser } from "fast-xml-parser";
import { Drone, Pilot, Point, Violator } from "../types/index";

/**
 * Parse a string of XML into an object. Includes XML element attributes.
 *
 * @see https://www.npmjs.com/package/fast-xml-parser
 * @param xml XML to be parsed as a string.
 * @returns JavaScript object equivalent of the XML.
 */
export const parseXML = ({ xml }: { xml: string }) => {
  const parserOptions = {
    ignoreAttributes: false,
  };
  const parser = new XMLParser(parserOptions);
  const parsedData = parser.parse(xml);

  return parsedData;
};

/**
 * Calculates the distance squared between two points in a two-dimensional space.
 *
 * @param pointOne Object represeting a point.
 * @param pointTwo Object represeting a point.
 * @returns Distance squared as a number.
 */
export const getDistanceSquared = (pointOne: Point, pointTwo: Point) => {
  return (
    Math.pow(pointOne.x - pointTwo.x, 2) + Math.pow(pointOne.y - pointTwo.y, 2)
  );
};

/**
 * Filters an array of drones to determine which ones are inside the forbidden area i.e. which drones are violators.
 *
 * @param drones Array of drones to be filtered.
 * @returns Array of drones that are inside the forbidden area.
 */
export const filterViolatorDrones = (drones: Drone[]) => {
  return drones.filter((drone) => {
    const dronePosition: Point = {
      x: drone.positionX,
      y: drone.positionY,
    };
    const center: Point = {
      x: 250000,
      y: 250000,
    };
    const distanceSquared = getDistanceSquared(dronePosition, center);
    const radiusSquared = Math.pow(100000, 2);

    if (distanceSquared < radiusSquared) return true;
  });
};

/**
 * Filters an array of violators that are expired (i.e. the timestamp is past 10 minutes).
 *
 * @param violators An array of violators.
 * @returns Filtered array of violators.
 */
export const filterExpiredViolators = (violators: Violator[]) => {
  return violators.filter((violator) => {
    const date = new Date(violator.timestamp);
    const dateNow = new Date(Date.now());
    if (dateNow.getTime() > date.getTime() + 600000) {
      return true;
    } else {
      return false;
    }
  });
};

/**
 * Gets a Violator from drone, pilot and timestamp.
 *
 * @param drone Drone object.
 * @param pilot Pilot object.
 * @param timestamp Timestamp representing the snapshot timestamp.
 * @returns Violator object.
 */
export const getViolator = (
  drone: Drone,
  pilot: Pilot,
  timestamp: string
): Violator => {
  return {
    serialNumber: drone.serialNumber,
    positionY: drone.positionY,
    positionX: drone.positionX,
    timestamp: timestamp,
    firstName: pilot.firstName,
    lastName: pilot.lastName,
    phoneNumber: pilot.phoneNumber,
    email: pilot.email,
  };
};

/**
 * Get current time timestamp in ISO format string.
 *
 * @returns ISO timestamp string.
 */
export const getNowTimestamp = () => {
  return new Date(Date.now()).toISOString();
};

/**
 * Get date in seconds. Uses getTime() from Date object.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTime
 * @param timestamp ISO timestamp string.
 * @returns Number of seconds.
 */
export const getDateInSeconds = (timestamp: string) => {
  return new Date(timestamp).getTime() / 1000;
};
