import { Request } from "express";
import { WebSocket } from "ws";
import WebSocketHandler from "../../lib/websockets/WebSocketHandler";
import RFIDManager from "../../RFIDManager";

// Events
import Ping from "./ping";

// WebSocket endpoint
export default (ws: WebSocket, req: Request) => {
    // Create manager from websocket
    const wsManager = new WebSocketHandler(ws);

    // Register events
    wsManager.listen(Ping);

    // Add socket to manager
    const rfidManager: RFIDManager = req.app.get("rfidManager");
    rfidManager.socketManager.addWebSocket(wsManager);
};
