import { CONFIG } from "./config";
import { startExpress } from "./express";
import { fetchDrones, fetchPilot } from "./services";
import {
  Drone,
  Pilot,
  Violator,
  WebSocketBroadcast,
  Point,
  DronesSnaphot,
} from "./types";
import {
  filterExpiredViolators,
  filterViolatorDrones,
  getDateInSeconds,
  getDistanceSquared,
  getNowTimestamp,
  getViolator,
} from "./utils";
import { startWebSocketServer } from "./websocketserver";

const app = startExpress();
const { wss, broadcast } = startWebSocketServer(app);

export let dronesSnapshotCache: DronesSnaphot;
export let violatorsCache: Violator[] = [];
let lastConnectionTimestamp: string = getNowTimestamp();

const maybeUpdateLastConnectionTimestamp = () => {
  if (wss.clients.size > 0) {
    lastConnectionTimestamp = getNowTimestamp();
  }
};

const clearExpiredViolators = () => {
  const expiredViolators = filterExpiredViolators(violatorsCache);
  violatorsCache = violatorsCache.filter(
    (violator) =>
      !expiredViolators.find(
        (expiredViolator) =>
          expiredViolator.serialNumber === violator.serialNumber
      )
  );
};

const maybeRunTask = () => {
  clearExpiredViolators();
  maybeUpdateLastConnectionTimestamp();
  const nowTimestamp: string = getNowTimestamp();
  const nowDateInSeconds: number = getDateInSeconds(nowTimestamp);
  const lastConnectionDateInSeconds: number = getDateInSeconds(
    lastConnectionTimestamp
  );
  if (
    lastConnectionDateInSeconds + CONFIG.MAX_IDLE_SECONDS >
    nowDateInSeconds
  ) {
    task();
  }
};

const task = async () => {
  try {
    dronesSnapshotCache = await fetchDrones();
    const snapshotViolatorDrones = filterViolatorDrones(
      dronesSnapshotCache.drones
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
        (violatorDrone) => violatorDrone.serialNumber === violator.serialNumber
      )
    );
    alreadySeenViolators.forEach((alreadySeenViolator) => {
      const violatorIndexInCache = violatorsCache.findIndex(
        (cachedViolator) =>
          cachedViolator.serialNumber === alreadySeenViolator.serialNumber
      );
      violatorsCache[violatorIndexInCache].timestamp =
        dronesSnapshotCache.timestamp;

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
      const cachedDistanceSquared = getDistanceSquared(cachedPosition, center);
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
        const violator: Violator = getViolator(
          violatorDrone,
          pilot,
          dronesSnapshotCache.timestamp
        );
        return violator;
      })
    );
    violatorsCache = [...violatorsCache, ...newViolators];

    const broadcastData: WebSocketBroadcast = {
      data: {
        dronesSnapshot: dronesSnapshotCache,
        violators: violatorsCache,
      },
    };

    broadcast(JSON.stringify(broadcastData));
  } catch (e) {
    console.error(e);
  }
};

const start = () => {
  setInterval(maybeRunTask, 2000);
};

start();
