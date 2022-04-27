"use strict";
exports.__esModule = true;
var express = require("express");
var ui_1 = require("./ui");
var path = require("path");
var route = express.Router();
// Create WebSocket endpoint
route.ws("/ws/ui", ui_1["default"]);
// Serve Client
var clientLocation = path.join(__dirname, "../../client/dist");
console.log(clientLocation);
// Add static UI endpoint (WARNING: UI first has to be build by navigating in the client directory and executing yarn build)
route.use(express.static(clientLocation));
exports["default"] = route;
