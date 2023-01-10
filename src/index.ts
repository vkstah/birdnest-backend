import * as dotenv from "dotenv";
dotenv.config();
import { startExpress } from "./express";
import { fetchDrones } from "./services";
import { fetchPilot } from "./services";
import { Drone, Pilot, Violator, WebSocketBroadcast, Point } from "./types";
import {
  filterExpiredViolators,
  filterViolatorDrones,
  getDistanceSquared,
} from "./utils";
import { startWebSocketServer } from "./websocketserver";

const app = startExpress();
const { wss, broadcast } = startWebSocketServer(app);
let violatorsCache: Violator[] = [];

/**
 * Main start function to start the interval.
 */
const start = () => {
  /**
   * The task function that will be called every two seconds.
   */
  const task = async () => {
    try {
      const dronesSnapshot = await fetchDrones();
      const snapshotViolatorDrones = filterViolatorDrones(
        dronesSnapshot.drones
      );

      /**
       * Array of violators that have expired (i.e. the timestamp is past 10 minutes).
       */
      const expiredViolators = filterExpiredViolators(violatorsCache);
      violatorsCache = violatorsCache.filter(
        (violator) =>
          !expiredViolators.find(
            (expiredViolator) =>
              expiredViolator.serialNumber === violator.serialNumber
          )
      );

      /**
       * Array of drones that violate the forbidden area and don't exist in the cache.
       */
      const newViolatorDrones: Drone[] = snapshotViolatorDrones.filter(
        (violatorDrone) => {
          return !violatorsCache.find(
            (violator) => violator.serialNumber === violatorDrone.serialNumber
          );
        }
      );

      /**
       * Array of violators that are in the current snapshot but
       * are also already present in the cache.
       */
      const alreadySeenViolators = violatorsCache.filter((violator) =>
        snapshotViolatorDrones.find(
          (violatorDrone) =>
            violatorDrone.serialNumber === violator.serialNumber
        )
      );
      alreadySeenViolators.forEach((alreadySeenViolator) => {
        const violatorIndexInCache = violatorsCache.findIndex(
          (cachedViolator) =>
            cachedViolator.serialNumber === alreadySeenViolator.serialNumber
        );
        violatorsCache[violatorIndexInCache].timestamp =
          dronesSnapshot.timestamp;

        const center: Point = {
          x: 250000,
          y: 250000,
        };
        const drone: Drone = snapshotViolatorDrones.find(
          (drone) => drone.serialNumber === alreadySeenViolator.serialNumber
        );
        const newPosition: Point = {
          x: drone.positionX,
          y: drone.positionY,
        };
        const cachedPosition: Point = {
          x: alreadySeenViolator.positionX,
          y: alreadySeenViolator.positionY,
        };
        const newDistanceSquared = getDistanceSquared(newPosition, center);
        const cachedDistanceSquared = getDistanceSquared(
          cachedPosition,
          center
        );
        if (newDistanceSquared < cachedDistanceSquared) {
          violatorsCache[violatorIndexInCache].positionX = newPosition.x;
          violatorsCache[violatorIndexInCache].positionY = newPosition.y;
        }
      });

      /**
       * Array of violators derived from the new violator drones.
       */
      const newViolators: Violator[] = await Promise.all(
        newViolatorDrones.map(async (violatorDrone) => {
          const pilot: Pilot = await fetchPilot(violatorDrone.serialNumber);
          const violator: Violator = {
            serialNumber: violatorDrone.serialNumber,
            positionX: violatorDrone.positionX,
            positionY: violatorDrone.positionY,
            timestamp: dronesSnapshot.timestamp,
            firstName: pilot.firstName,
            lastName: pilot.lastName,
            phoneNumber: pilot.phoneNumber,
            email: pilot.email,
          };
          return violator;
        })
      );
      violatorsCache = [...violatorsCache, ...newViolators];

      const broadcastData: WebSocketBroadcast = {
        data: {
          dronesSnapshot,
          violators: violatorsCache,
        },
      };

      broadcast(JSON.stringify(broadcastData));
    } catch (e) {
      console.error(e);
    }
  };
  setInterval(task, 2000);
};

start();
