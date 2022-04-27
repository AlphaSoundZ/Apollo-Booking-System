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
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../../config/logger");
const DisplayError_1 = require("../DisplayError");
const API_1 = require("../API");
/**
 * Manages all websocket connections
 */
class WebSocketManager {
    constructor() {
        this.sockets = [];
    }
    /**
     * Add a WebSocket to the manager
     * @param ws WebSocket to be added
     */
    addWebSocket(ws) {
        ws.onclose(() => {
            this.removeWebSocket(ws);
        });
        this.sockets.push(ws);
        logger_1.default.debug("New UI connection");
    }
    /**
     * Remove a WebSocket from the manager
     * @param ws WebSocket to be removed
     */
    removeWebSocket(ws) {
        this.sockets.splice(this.sockets.indexOf(ws));
        logger_1.default.debug("Lost UI connection");
    }
    /**
     * Send UI state to UI
     * @param state UI state for UI
     * @param data data for UI
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sendUI(state, data = {}, returnTarget) {
        return __awaiter(this, void 0, void 0, function* () {
            this.send("uistate", { state, returnTarget, data });
        });
    }
    /**
     * Send event to UI
     * @param eventName Event name for UI
     * @param data Event data for UI
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    send(eventName, data = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const ws of this.sockets) {
                yield ws.triggerEvent(eventName, data);
            }
        });
    }
    /**
     * Send error to UI
     * @param req Server error
     */
    sendError(error) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.send("error", {
                code: error.response.identifier,
                message: error.message,
                returnTarget: error.returnTarget,
            });
        });
    }
    /**
     * Pass the error to UI and log
     * @param err The error thrown
     * @param message A custom log message
     */
    catchError(err, message, returnTarget = DisplayError_1.ReturnTarget.HOME) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.error(message + ":", err);
            try {
                yield this.sendError(new DisplayError_1.default(API_1.ResponseType.UNEXPECTED_ERROR, message, returnTarget));
            }
            catch (uErr) {
                logger_1.default.error("Error occurred while reporting error to UI:", uErr);
            }
        });
    }
}
exports.default = WebSocketManager;
//# sourceMappingURL=WebSocketManager.js.map