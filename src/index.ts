// Load env
import * as dotenv from "dotenv";
dotenv.config();

// Imports
import * as express from "express";
import * as cors from "cors";
import * as expressWs from "express-ws";
import axios from "axios";
import logger from "./config/logger";
import RFIDManager from "./RFIDManager";

// Defining app
const uiPort = process.env.UI_PORT;
const apiUrl = process.env.API_URL;
const app = express();
expressWs(app);

// Importing routes
import routes from "./routes";

// Program initialization is async
(async () => {
    logger.info("Checking server connection...");
    let connectionSuccessful = false;

    // Check for server availability every 15 seconds until working
    while (!connectionSuccessful) {
        try {
            const response = await axios.get(apiUrl);
            if (response.data.response != 7) {
                logger.error(
                    "Server responded with error code:",
                    response.data.response,
                    "Message:",
                    response.data.message,
                );
                connectionSuccessful = false;
                logger.info("Trying to reconnect in 15 seconds");
                await new Promise((resolve) => setTimeout(resolve, 15000));
            } else {
                connectionSuccessful = true;
            }
        } catch (err) {
            logger.error("Could not connect to server:", err);
            connectionSuccessful = false;
            logger.info("Trying to reconnect in 15 seconds");
            await new Promise((resolve) => setTimeout(resolve, 15000));
        }
    }
    logger.info("Successfully connected to server");

    // Setting up rfid routine
    const rfidManager = new RFIDManager(apiUrl);

    // Setting up express extensions
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.set("rfidManager", rfidManager);

    // Registering routes
    app.use(routes);

    app.listen(uiPort, () => {
        logger.info("Started. UI reachable through http://127.0.0.1:" + uiPort + "/#/ui");
    });
})();
