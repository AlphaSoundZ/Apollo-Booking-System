"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const ui_1 = require("./ui");
const path = require("path");
const route = express.Router();
// Create WebSocket endpoint
route.ws("/ws/ui", ui_1.default);
// Serve Client
const clientLocation = path.join(__dirname, "../../client/dist");
console.log(clientLocation);
// Add static UI endpoint (WARNING: UI first has to be build by navigating in the client directory and executing yarn build)
route.use(express.static(clientLocation));
exports.default = route;
//# sourceMappingURL=index.js.map