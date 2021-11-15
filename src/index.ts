// Load env
import * as dotenv from "dotenv";
dotenv.config();

// Imports
import * as express from "express";
import * as cors from "cors";
import * as expressWs from "express-ws";
import db from "./config/database";
import logger from "./config/logger";

// Defining app
const port = process.env.PORT;
const app = express();
expressWs(app);

// Importing routes
import routes from "./routes";

(async () => {
    // Database setup
    logger.info("Syncing database...");
    await db.sync();

    // Setting up express extensions
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Registering routes
    app.use(routes);

    app.listen(port, () => {
        logger.info("Started. UI reachable through http://127.0.0.1:" + port + "/#/ui");
    });
})();
