"use strict";
exports.__esModule = true;
var WebSocketHandler_1 = require("../../lib/websockets/WebSocketHandler");
// Events
var ping_1 = require("./ping");
// WebSocket endpoint
exports["default"] = (function (ws, req) {
    // Create manager from websocket
    var wsManager = new WebSocketHandler_1["default"](ws);
    // Register events
    wsManager.listen(ping_1["default"]);
    // Add socket to manager
    var rfidManager = req.app.get("rfidManager");
    rfidManager.socketManager.addWebSocket(wsManager);
});
