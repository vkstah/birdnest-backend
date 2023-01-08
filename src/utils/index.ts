import { XMLParser } from "fast-xml-parser";
import { Drone, Point, Violator } from "../types/index";

/**
 * Parse a string of XML into an object. Includes XML element attributes.
 *
 * A JavaScript object equivalent of the XML.
 *
 * @param xml String of XML to be parsed.
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
 * Returns the distance squared as a number.
 *
 * @param pointOne Object represeting a point.
 * @param pointTwo Object represeting a point.
 */
export const getDistanceSquared = (pointOne: Point, pointTwo: Point) => {
  return (
    Math.pow(pointOne.x - pointTwo.x, 2) + Math.pow(pointOne.y - pointTwo.y, 2)
  );
};

/**
 * Filters an array of drones to determine which ones are inside the forbidden area i.e. which drones are violators.
 *
 * Returns an array of drones that are inside the forbidden area.
 *
 * @param drones Array of drones to be filtered.
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
 * Filters an array of violators that are expired.
 *
 * Returns a filtered array of violators.
 *
 * @param violators An array of violators.
 */
export const filterExpiredViolators = (violators: Violator[]) => {
  return violators.filter((violator) => {
    const date = new Date(violator.timestamp + "Z");
    const dateNow = new Date(Date.now());
    if (dateNow.getTime() > date.getTime() + 600000) {
      return true;
    } else {
      return false;
    }
  });
};
