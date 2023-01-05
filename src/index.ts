import { startExpress } from "./express";
import { startWebSocketServer } from "./websocketserver";

const app = startExpress();
const broadcast = startWebSocketServer(app);
