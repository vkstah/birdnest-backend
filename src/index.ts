import { startExpress } from "./express";
import { fetchDrones } from "./services";
import { WebSocketBroadcast } from "./types/";
import { startWebSocketServer } from "./websocketserver";

const app = startExpress();
const { wss, broadcast } = startWebSocketServer(app);

const start = () => {
  const task = async () => {
    const droneData = await fetchDrones();

    const data: WebSocketBroadcast = {
      data: droneData,
      error: "",
    };

    broadcast(JSON.stringify(data));
  };

  setInterval(task, 2000);
};

start();
