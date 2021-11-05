import { WebSocket } from "ws";
import WebSocketManager from "../../lib/WebSocketManager";

// Events
import Ping from "./ping";

export default (ws: WebSocket) => {
    const wsManager = new WebSocketManager(ws);

    // Register events
    wsManager.listen(Ping);
};
