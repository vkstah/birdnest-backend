import { startExpress } from "./express";
import { fetchDrones } from "./services";
import { WebSocketBroadcast } from "./types/";
import { startWebSocketServer } from "./websocketserver";

const app = startExpress();
const { wss, broadcast } = startWebSocketServer(app);

const start = () => {
  const task = async () => {
    try {
      const droneData = await fetchDrones();

      const data: WebSocketBroadcast = {
        data: droneData,
        error: "",
      };

      broadcast(JSON.stringify(data));
    } catch (e) {
      console.error(e);
    }
  };
  setInterval(task, 2000);
};

start();
