import WebSocket, { WebSocketServer } from "ws";
import { Server as HttpServer } from "http";

interface ExtWebSocket extends WebSocket {
  isAlive: boolean;
}

export const startWebSocketServer = (app: HttpServer) => {
  const wss = new WebSocketServer({ server: app });

  console.log("WebSocketServer is running!");

  wss.on("connection", (ws: ExtWebSocket, req) => {
    const remoteAddress =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    console.log(`New client (${remoteAddress}) connected!`);
    ws.isAlive = true;

    ws.on("pong", () => {
      ws.isAlive = true;
    });

    ws.on("close", () => {
      console.log(`Client (${remoteAddress}) has disconnected!`);
    });
  });

  // Heartbeat interval to cleanup broken connections
  const interval = setInterval(() => {
    wss.clients.forEach((ws: ExtWebSocket) => {
      if (ws.isAlive === false) return ws.terminate();

      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on("close", () => {
    clearInterval(interval);
    console.log("WebSocketServer is closed!");
  });

  return {
    wss,
    broadcast: (data: string) => {
      wss.clients.forEach((client) => {
        if (WebSocket.OPEN === client.readyState) client.send(data);
      });
    },
  };
};
