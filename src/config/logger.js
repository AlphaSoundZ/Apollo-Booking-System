"use strict";
exports.__esModule = true;
var log4js = require("log4js");
var path = require("path");
// Check for development environment
var devMode = (process.env.NODE_ENV || "development") == "development";
// Get logs path and log level
var logPath = path.join(__dirname, "../../", "logs");
var logLevel = devMode ? "debug" : "info";
// Configure log4js (log4shell does not exists)
log4js.configure({
    appenders: {
        log: {
            type: "file",
            filename: path.join(logPath, "log.log")
        },
        console: {
            type: "stdout"
        }
    },
    categories: {
        "default": {
            appenders: ["log", "console"],
            level: logLevel
        },
        server: {
            appenders: ["log", "console"],
            level: logLevel
        }
    }
});
exports["default"] = log4js.getLogger("server");
