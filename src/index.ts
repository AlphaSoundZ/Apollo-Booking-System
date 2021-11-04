import * as dotenv from "dotenv";
import * as express from "express";
import * as expressWs from "express-ws";
import * as cors from "cors"
import logger from "./logger";


dotenv.config();

(async () => {
    const port = process.env.PORT;
    const app = express();
    
    logger.info("Syncing database...");
    // Sequelize setup here

    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({extended: true}));

    app.listen(port, () => {
        logger.info("Started. UI Reachable through http://localhost:" + port + "/");
    });
})();