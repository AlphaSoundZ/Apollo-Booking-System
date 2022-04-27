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
var logger_1 = require("./config/logger");
var API_1 = require("./lib/API");
var DisplayError_1 = require("./lib/DisplayError");
var UIState_1 = require("./lib/UIState");
var ScanHandler = /** @class */ (function () {
    function ScanHandler(socketManager, api) {
        this.active = false;
        this.busy = false;
        this.uid = null;
        this.logoutTimeout = null;
        this.socketManager = socketManager;
        this.api = api;
    }
    ScanHandler.prototype.run = function (uid) {
        return __awaiter(this, void 0, void 0, function () {
            var info, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.active)
                            return [2 /*return*/];
                        this.active = true;
                        this.busy = true;
                        this.socketManager.send(UIState_1.UIState.GETTING_CHIP_INFO);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.api.unknownActionForUid(uid)];
                    case 2:
                        info = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        this.socketManager.catchError(err_1, "Error occurred while checking uid.");
                        this.complete();
                        return [2 /*return*/];
                    case 4:
                        if (info.response == API_1.ResponseType.DEVICE_RETURNED) {
                            // UUID is device and specified device got returned
                            logger_1["default"].debug("Device returned (ID: " + info.device.id + ")");
                            this.socketManager.send(UIState_1.UIState.DEVICE_RETURNED);
                            this.complete();
                        }
                        else if (info.response == API_1.ResponseType.USER_INFO) {
                            // UUID is user and info got returned
                            this.uid = uid;
                            this.socketManager.send(UIState_1.UIState.USER_INFO, { user: info.user });
                            this.complete(true, info.user.teacher);
                        }
                        else if (info.response.error) {
                            // An server error occurred
                            this.socketManager.sendError(new DisplayError_1["default"](info.response, info.message, DisplayError_1.ReturnTarget.HOME));
                            this.complete();
                        }
                        else {
                            // Unexpected result
                            this.socketManager.sendError(new DisplayError_1["default"](API_1.ResponseType.UNEXPECTED_ERROR, "Unknown API response.", DisplayError_1.ReturnTarget.HOME));
                            this.complete();
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    ScanHandler.prototype.moreInput = function (uid) {
        return __awaiter(this, void 0, void 0, function () {
            var booking, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.active || this.busy || this.uid == null)
                            return [2 /*return*/];
                        this.busy = true;
                        if (uid == this.uid) {
                            // Manual logout
                            logger_1["default"].info("User manually logged out");
                            this.socketManager.send(UIState_1.UIState.USER_LOGOUT);
                            this.complete();
                            return [2 /*return*/];
                        }
                        this.socketManager.send(UIState_1.UIState.DEVICE_BOOKING_LOADING);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.api.book(this.uid, uid)];
                    case 2:
                        booking = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_2 = _a.sent();
                        this.socketManager.catchError(err_2, "Error occurred while booking device.");
                        this.complete();
                        return [2 /*return*/];
                    case 4:
                        if (booking.response.error) {
                            logger_1["default"].debug("Booking failed (" + booking.response.identifier + "): " + booking.message);
                            this.socketManager.sendError(new DisplayError_1["default"](booking.response, booking.message, DisplayError_1.ReturnTarget.USER_HOME));
                            this.complete(booking.user.teacher, booking.user.teacher);
                            return [2 /*return*/];
                        }
                        logger_1["default"].debug("Booking completed (ID: " + booking.device.id + ")");
                        this.socketManager.send(UIState_1.UIState.DEVICE_BOOKING_COMPLETED);
                        this.complete(booking.user.teacher, booking.user.teacher);
                        return [2 /*return*/];
                }
            });
        });
    };
    ScanHandler.prototype.complete = function (moreActionsAllowed, infiniteLogoutTimeout) {
        var _this = this;
        if (moreActionsAllowed === void 0) { moreActionsAllowed = false; }
        if (infiniteLogoutTimeout === void 0) { infiniteLogoutTimeout = false; }
        this.busy = true;
        this.active = moreActionsAllowed;
        // Handling logout timeout
        if (this.logoutTimeout)
            clearTimeout(this.logoutTimeout);
        if (moreActionsAllowed && !infiniteLogoutTimeout) {
            this.logoutTimeout = setTimeout(function () {
                _this.socketManager.send(UIState_1.UIState.USER_LOGOUT);
                _this.complete();
            }, ScanHandler.LOGOUT_TIMEOUT);
        }
    };
    ScanHandler.prototype.cancel = function () {
        this.complete();
    };
    ScanHandler.LOGOUT_TIMEOUT = Number.parseInt(process.env.LOGOUT_TIMEOUT);
    return ScanHandler;
}());
exports["default"] = ScanHandler;
