// Load env
import * as dotenv from "dotenv";
dotenv.config();

import * as log4js from "log4js";
import * as path from "path";

// Get logs path and log level
const logPath = path.join(__dirname, "../../", "logs");
const logLevel = process.env.LOG_LEVEL;

// Configure log4js (log4shell does not exists)
log4js.configure({
    appenders: {
        log: {
            type: "file",
            filename: path.join(logPath, "log.log"),
        },
        console: {
            type: "stdout",
        },
    },
    categories: {
        default: {
            appenders: ["log", "console"],
            level: logLevel,
        },
        server: {
            appenders: ["log", "console"],
            level: logLevel,
        },
        cli: {
            appenders: ["log", "console"],
            level: logLevel,
        },
    },
});

export default log4js.getLogger("server");
