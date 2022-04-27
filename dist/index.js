"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// Load env
const dotenv = require("dotenv");
dotenv.config();
// Imports
const express = require("express");
const cors = require("cors");
const expressWs = require("express-ws");
const logger_1 = require("./config/logger");
const RFIDManager_1 = require("./RFIDManager");
const API_1 = require("./lib/API");
// Defining app
const registerMode = process.argv.includes("--register-devices");
const uiPort = process.env.UI_PORT;
const api = new API_1.default(process.env.API_URL);
const app = express();
expressWs(app);
// Importing routes
const routes_1 = require("./routes");
// Program initialization is async
(() => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info("Checking server connection...");
    let connectionSuccessful = false;
    // Check for server availability every 15 seconds until working
    while (!connectionSuccessful) {
        try {
            const response = yield api.status();
            if (response.response != API_1.ResponseType.NO_UUID_SPECIFIED) {
                logger_1.default.error("Server responded with error:", response.response.name, "Message:", response.message);
                connectionSuccessful = false;
                logger_1.default.info("Trying to reconnect in 15 seconds");
                yield new Promise((resolve) => setTimeout(resolve, 15000));
            }
            else {
                connectionSuccessful = true;
            }
        }
        catch (err) {
            logger_1.default.error("Could not connect to server:", err.message);
            connectionSuccessful = false;
            logger_1.default.info("Trying to reconnect in 15 seconds");
            yield new Promise((resolve) => setTimeout(resolve, 15000));
        }
    }
    logger_1.default.info("Server connection established");
    // Setting up rfid routine
    const rfidManager = new RFIDManager_1.default(api, registerMode);
    // Setting up express extensions
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.set("rfidManager", rfidManager);
    // Registering routes
    app.use(routes_1.default);
    if (!registerMode)
        app.listen(uiPort, () => {
            logger_1.default.info("Started. UI reachable through http://127.0.0.1:" + uiPort + "/#/ui");
        });
}))();
//# sourceMappingURL=index.js.map