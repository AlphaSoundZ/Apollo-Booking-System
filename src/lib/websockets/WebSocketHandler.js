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
exports.WSEventListener = void 0;
var logger_1 = require("../../config/logger");
// Event listener that can be added to the manager
var WSEventListener = /** @class */ (function () {
    function WSEventListener(eventName, callback) {
        this.eventName = eventName;
        this.callback = callback;
    }
    return WSEventListener;
}());
exports.WSEventListener = WSEventListener;
var WebSocketHandler = /** @class */ (function () {
    /**
     * Initialize the manager
     * @param ws The websocket the manager is using
     */
    function WebSocketHandler(ws) {
        var _this = this;
        this.listeners = [];
        this.onCloseListener = [];
        this.ws = ws;
        // Setup close listener
        this.ws.on("close", function () {
            for (var _i = 0, _a = _this.onCloseListener; _i < _a.length; _i++) {
                var listener = _a[_i];
                listener();
            }
        });
        // Setup event listeners
        this.ws.on("message", function (data) {
            var req;
            try {
                var response = JSON.parse(data);
                if (response.type !== "event")
                    return;
                if (!response.event)
                    throw new Error("No event specified");
                req = response;
            }
            catch (err) {
                // Send error to websocket if can not parse
                logger_1["default"].warn("Received invalid JSON object from websocket:", err);
                _this.sendJSON({
                    type: "error",
                    success: false,
                    error: "INVALID_REQUEST",
                    message: "Received invalid JSON object"
                });
                return;
            }
            var eventFound = false;
            var _loop_1 = function (listener) {
                if (listener.eventName !== req.event)
                    return "continue";
                eventFound = true;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                var respond = function (data) {
                    _this.sendJSON({ type: "response", to: listener.eventName, data: data });
                };
                if (req.data)
                    listener.callback({ manager: _this, data: req.data, respond: respond });
                else
                    listener.callback({
                        manager: _this,
                        data: {},
                        respond: respond
                    });
            };
            for (var _i = 0, _a = _this.listeners; _i < _a.length; _i++) {
                var listener = _a[_i];
                _loop_1(listener);
            }
            if (!eventFound) {
                logger_1["default"].warn("Received invalid event from websocket:", req.event);
                _this.sendJSON({
                    type: "response",
                    success: false,
                    error: "UNKNOWN_EVENT",
                    message: "The specified event was not found"
                });
            }
        });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    WebSocketHandler.prototype.sendJSON = function (value) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.ws.send(JSON.stringify(value), function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    WebSocketHandler.prototype.triggerEvent = function (eventName, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.sendJSON({ type: "event", event: eventName, data: data })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Add close listener
     * @param listener lambda event function
     */
    WebSocketHandler.prototype.onclose = function (listener) {
        this.onCloseListener.push(listener);
    };
    /**
     * Add an event listener
     * @param listener The event listener
     */
    WebSocketHandler.prototype.listen = function (listener) {
        this.listeners.push(listener);
    };
    return WebSocketHandler;
}());
exports["default"] = WebSocketHandler;
