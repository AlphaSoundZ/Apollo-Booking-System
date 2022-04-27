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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
// Load env
var dotenv = require("dotenv");
dotenv.config();
// Imports
var express = require("express");
var cors = require("cors");
var expressWs = require("express-ws");
var logger_1 = require("./config/logger");
var RFIDManager_1 = require("./RFIDManager");
// Defining app
var uiPort = process.env.UI_PORT;
var api = new API_1["default"](process.env.API_URL);
var app = express();
expressWs(app);
// Importing routes
var routes_1 = require("./routes");
var API_1 = require("./lib/API");
// Program initialization is async
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var connectionSuccessful, response, err_1, rfidManager;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                logger_1["default"].info("Checking server connection...");
                connectionSuccessful = false;
                _a.label = 1;
            case 1:
                if (!!connectionSuccessful) return [3 /*break*/, 10];
                _a.label = 2;
            case 2:
                _a.trys.push([2, 7, , 9]);
                return [4 /*yield*/, api.status()];
            case 3:
                response = _a.sent();
                if (!(response.response != API_1.ResponseType.NO_UUID_SPECIFIED)) return [3 /*break*/, 5];
                logger_1["default"].error("Server responded with error:", response.response.name, "Message:", response.message);
                connectionSuccessful = false;
                logger_1["default"].info("Trying to reconnect in 15 seconds");
                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 15000); })];
            case 4:
                _a.sent();
                return [3 /*break*/, 6];
            case 5:
                connectionSuccessful = true;
                _a.label = 6;
            case 6: return [3 /*break*/, 9];
            case 7:
                err_1 = _a.sent();
                logger_1["default"].error("Could not connect to server:", err_1.message);
                connectionSuccessful = false;
                logger_1["default"].info("Trying to reconnect in 15 seconds");
                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 15000); })];
            case 8:
                _a.sent();
                return [3 /*break*/, 9];
            case 9: return [3 /*break*/, 1];
            case 10:
                logger_1["default"].info("Server connection established");
                rfidManager = new RFIDManager_1["default"](api);
                // Setting up express extensions
                app.use(cors());
                app.use(express.json());
                app.use(express.urlencoded({ extended: true }));
                app.set("rfidManager", rfidManager);
                // Registering routes
                app.use(routes_1["default"]);
                app.listen(uiPort, function () {
                    logger_1["default"].info("Started. UI reachable through http://127.0.0.1:" + uiPort + "/#/ui");
                });
                return [2 /*return*/];
        }
    });
}); })();
