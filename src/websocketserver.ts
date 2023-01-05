import { Server } from "ws";
import { Server as HttpServer } from "http";

export const startWebSocketServer = (app: HttpServer) => {
  const wss = new Server({ server: app });

  console.log("WebSocketServer is running!");

  wss.on("connection", (ws) => {
    console.log("New connection!");
  });

  return () => {
    wss.clients.forEach((client) => {
      if (WebSocket.OPEN === client.readyState) client.send("New broadcast!");
    });
  };
};
