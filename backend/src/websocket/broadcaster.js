import { WebSocketServer } from "ws";

let wss = null;
const clients = new Set();

export function initWebSocket(server) {
  wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws) => {
    clients.add(ws);

    ws.on("close", () => clients.delete(ws));
    ws.on("error", () => clients.delete(ws));

    // Heartbeat ping
    ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data);
        if (msg.type === "ping") ws.send(JSON.stringify({ type: "pong" }));
      } catch {
        // ignore malformed messages
      }
    });
  });

  // Server-side heartbeat every 30s to cull dead sockets
  const interval = setInterval(() => {
    clients.forEach((ws) => {
      if (ws.readyState !== ws.OPEN) clients.delete(ws);
    });
  }, 30000);

  wss.on("close", () => clearInterval(interval));

  console.log("WebSocket server ready at /ws");
  return wss;
}

export function broadcast(payload) {
  const data = JSON.stringify(payload);
  clients.forEach((ws) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(data);
    }
  });
}
