// Load env
import * as dotenv from "dotenv";
dotenv.config();

// Imports
import * as express from "express";
import * as cors from "cors";
import * as expressWs from "express-ws";
import logger from "./config/logger";
import RFIDManager from "./RFIDManager";

// Defining app
const uiPort = process.env.UI_PORT;
const apiUrl = process.env.API_URL;
const app = express();
expressWs(app);

// Importing routes
import routes from "./routes";

(async () => {
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
