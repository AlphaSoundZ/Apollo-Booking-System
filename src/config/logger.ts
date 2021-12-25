import * as log4js from "log4js";
import * as path from "path";

// Check for development environment
const devMode = (process.env.NODE_ENV || "development") == "development";

// Get logs path and log level
const logPath = path.join(__dirname, "../../", "logs");
const logLevel = devMode ? "debug" : "info";

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
    },
});

export default log4js.getLogger("server");
