import { startExpress } from "./express";
import { fetchDrones } from "./fetchDrones";
import { startWebSocketServer } from "./websocketserver";

const app = startExpress();
const broadcast = startWebSocketServer(app);

setInterval(() => {
  // fetchDrones();
  broadcast();
}, 1000);
