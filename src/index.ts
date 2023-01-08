import * as dotenv from "dotenv";
dotenv.config();
import { deleteViolators, fetchViolators, insertViolators } from "./database";
import { startExpress } from "./express";
import { fetchDrones } from "./services";
import { fetchPilot } from "./services";
import { Drone, Pilot, Violator, WebSocketBroadcast } from "./types";
import { filterExpiredViolators, filterViolatorDrones } from "./utils";
import { startWebSocketServer } from "./websocketserver";

const app = startExpress();
const { wss, broadcast } = startWebSocketServer(app);

const start = () => {
  const task = async () => {
    try {
      const dronesSnapshot = await fetchDrones();
      const snapshotViolatorDrones = filterViolatorDrones(
        dronesSnapshot.drones
      );

      const {
        data: databaseStoredViolators,
        error: databaseStoredViolatorsError,
      } = await fetchViolators();

      if (databaseStoredViolatorsError) {
        throw new Error(databaseStoredViolatorsError.message);
      }

      /**
       * Filter new violator drones that don't exist in the database,
       * create the violator objects and add them to the database.
       */
      const newViolatorDrones: Drone[] = snapshotViolatorDrones.filter(
        (violatorDrone) => {
          return !databaseStoredViolators.find(
            (violator) => violator.serialNumber === violatorDrone.serialNumber
          );
        }
      );
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
      if (newViolators.length > 0) {
        console.log(`Inserting ${newViolators.length} violators`);
        const {
          data: databaseInsertedViolators,
          error: databaseInsertedViolatorsError,
        } = await insertViolators(newViolators);
      }

      /**
       * Filter expired violators and remove them from the database.
       */
      const expiredViolators = filterExpiredViolators(databaseStoredViolators);
      if (expiredViolators.length > 0) {
        console.log(`Deleting ${expiredViolators.length} violators`);
        const { error } = await deleteViolators(
          expiredViolators.map((violator) => violator.serialNumber)
        );
      }

      const data: WebSocketBroadcast = {
        data: {
          dronesSnapshot,
        },
      };

      broadcast(JSON.stringify(data));
    } catch (e) {
      console.error(e);
    }
  };
  const interval = setInterval(task, 2000);
};

start();
