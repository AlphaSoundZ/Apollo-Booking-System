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
exports.WSEventListener = void 0;
const logger_1 = require("../../config/logger");
// Event listener that can be added to the manager
class WSEventListener {
    constructor(eventName, callback) {
        this.eventName = eventName;
        this.callback = callback;
    }
}
exports.WSEventListener = WSEventListener;
class WebSocketHandler {
    /**
     * Initialize the manager
     * @param ws The websocket the manager is using
     */
    constructor(ws) {
        this.listeners = [];
        this.onCloseListener = [];
        this.ws = ws;
        // Setup close listener
        this.ws.on("close", () => {
            for (const listener of this.onCloseListener) {
                listener();
            }
        });
        // Setup event listeners
        this.ws.on("message", (data) => {
            let req;
            try {
                const response = JSON.parse(data);
                if (response.type !== "event")
                    return;
                if (!response.event)
                    throw new Error("No event specified");
                req = response;
            }
            catch (err) {
                // Send error to websocket if can not parse
                logger_1.default.warn("Received invalid JSON object from websocket:", err);
                this.sendJSON({
                    type: "error",
                    success: false,
                    error: "INVALID_REQUEST",
                    message: "Received invalid JSON object",
                });
                return;
            }
            let eventFound = false;
            for (const listener of this.listeners) {
                if (listener.eventName !== req.event)
                    continue;
                eventFound = true;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const respond = (data) => {
                    this.sendJSON({ type: "response", to: listener.eventName, data: data });
                };
                if (req.data)
                    listener.callback({ manager: this, data: req.data, respond });
                else
                    listener.callback({
                        manager: this,
                        data: {},
                        respond,
                    });
            }
            if (!eventFound) {
                logger_1.default.warn("Received invalid event from websocket:", req.event);
                this.sendJSON({
                    type: "response",
                    success: false,
                    error: "UNKNOWN_EVENT",
                    message: "The specified event was not found",
                });
            }
        });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sendJSON(value) {
        return new Promise((resolve, reject) => {
            this.ws.send(JSON.stringify(value), (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    triggerEvent(eventName, data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.sendJSON({ type: "event", event: eventName, data: data });
        });
    }
    /**
     * Add close listener
     * @param listener lambda event function
     */
    onclose(listener) {
        this.onCloseListener.push(listener);
    }
    /**
     * Add an event listener
     * @param listener The event listener
     */
    listen(listener) {
        this.listeners.push(listener);
    }
}
exports.default = WebSocketHandler;
//# sourceMappingURL=WebSocketHandler.js.map