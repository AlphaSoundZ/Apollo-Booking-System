import * as log4js from "log4js";
import * as path from "path";


const devMode = (process.env.NODE_ENV || "development") == "development";

const logPath = path.join(__dirname, "../", "logs");
const logLevel = devMode ? "debug" : "info";

log4js.configure({
    appenders: {
        database: {
            type: "file",
            filename: path.join(logPath, "db.log"),
        },
        log: {
            type: "file",
            filename: path.join(logPath, "log.log"),
        },
        console: {
            type: "stdout",
        }
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
        database: {
            appenders: ["database"],
            level: logLevel
        }
    }
});

export default log4js.getLogger("server");