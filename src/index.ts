// Load env
import * as dotenv from "dotenv";
dotenv.config();

// Imports
import * as express from "express";
import * as cors from "cors";
import db from "./config/database";
import logger from "./config/logger";

(async () => {
    const port = process.env.PORT;
    const app = express();

    logger.info("Syncing database...");
    await db.sync();

    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.listen(port, () => {
        logger.info("Started. UI reachable through http://127.0.0.1:" + port + "/");
    });
})();
