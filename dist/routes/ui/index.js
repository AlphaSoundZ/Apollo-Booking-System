"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocketHandler_1 = require("../../lib/websockets/WebSocketHandler");
// Events
const ping_1 = require("./ping");
// WebSocket endpoint
exports.default = (ws, req) => {
    // Create manager from websocket
    const wsManager = new WebSocketHandler_1.default(ws);
    // Register events
    wsManager.listen(ping_1.default);
    // Add socket to manager
    const rfidManager = req.app.get("rfidManager");
    rfidManager.socketManager.addWebSocket(wsManager);
};
//# sourceMappingURL=index.js.map