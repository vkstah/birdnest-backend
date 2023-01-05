import { Server } from "ws";
import { Server as HttpServer } from "http";

export const startWebSocketServer = (app: HttpServer) => {
  const wss = new Server({ server: app });

  console.log("WebSocketServer is running!");

  return () => {
    wss.clients.forEach((client) => console.log("New broadcast!"));
  };
};
