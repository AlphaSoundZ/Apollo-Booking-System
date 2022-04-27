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
const logger_1 = require("./config/logger");
const API_1 = require("./lib/API");
const DisplayError_1 = require("./lib/DisplayError");
const UIState_1 = require("./lib/UIState");
class ScanHandler {
    constructor(socketManager, api) {
        this.active = false;
        this.busy = false;
        this.uid = null;
        this.logoutTimeout = null;
        this.socketManager = socketManager;
        this.api = api;
    }
    run(uid) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.active)
                return;
            this.active = true;
            this.busy = true;
            this.socketManager.sendUI(UIState_1.UIState.GETTING_CHIP_INFO);
            let info;
            try {
                info = yield this.api.unknownActionForUid(uid);
            }
            catch (err) {
                this.socketManager.catchError(err, "Error occurred while checking uid.");
                this.complete();
                return;
            }
            if (info.response == API_1.ResponseType.DEVICE_RETURNED) {
                // UUID is device and specified device got returned
                logger_1.default.info(`Device returned (ID: ${info.device.id})`);
                this.socketManager.sendUI(UIState_1.UIState.DEVICE_RETURNED);
                this.complete();
            }
            else if (info.response == API_1.ResponseType.USER_INFO) {
                // UUID is user and info got returned
                this.uid = uid;
                this.socketManager.sendUI(UIState_1.UIState.USER_INFO, { user: info.user });
                this.complete(true, info.user.teacher);
            }
            else if (info.response.error) {
                // An server error occurred
                this.socketManager.sendError(new DisplayError_1.default(info.response, info.message, DisplayError_1.ReturnTarget.HOME));
                this.complete();
            }
            else {
                // Unexpected result
                this.socketManager.sendError(new DisplayError_1.default(API_1.ResponseType.UNEXPECTED_ERROR, "Unknown API response.", DisplayError_1.ReturnTarget.HOME));
                this.complete();
            }
        });
    }
    moreInput(uid) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.active || this.busy || this.uid == null)
                return;
            this.busy = true;
            if (uid == this.uid) {
                // Manual logout
                logger_1.default.info("User manually logged out");
                this.socketManager.sendUI(UIState_1.UIState.USER_LOGOUT);
                this.complete();
                return;
            }
            this.socketManager.sendUI(UIState_1.UIState.DEVICE_BOOKING_LOADING);
            let booking;
            try {
                booking = yield this.api.book(this.uid, uid);
            }
            catch (err) {
                this.socketManager.catchError(err, "Error occurred while booking device.", DisplayError_1.ReturnTarget.USER_HOME);
                this.complete(true);
                return;
            }
            if (booking.response.error) {
                logger_1.default.info(`Booking failed (${booking.response.identifier}): ${booking.message}`);
                this.socketManager.sendError(new DisplayError_1.default(booking.response, booking.message, DisplayError_1.ReturnTarget.USER_HOME));
                this.complete(true);
                return;
            }
            logger_1.default.info(`Booking completed (ID: ${booking.device.id})`);
            this.socketManager.sendUI(UIState_1.UIState.DEVICE_BOOKING_COMPLETED, {}, booking.user.teacher ? DisplayError_1.ReturnTarget.USER_HOME : DisplayError_1.ReturnTarget.HOME);
            this.complete(booking.user.teacher, booking.user.teacher);
        });
    }
    complete(moreActionsAllowed = false, infiniteLogoutTimeout = false) {
        this.busy = false;
        this.active = moreActionsAllowed;
        // Handling logout timeout
        if (this.logoutTimeout)
            clearTimeout(this.logoutTimeout);
        if (moreActionsAllowed && !infiniteLogoutTimeout) {
            this.logoutTimeout = setTimeout(() => {
                this.socketManager.sendUI(UIState_1.UIState.USER_LOGOUT);
                this.complete();
            }, ScanHandler.LOGOUT_TIMEOUT);
        }
    }
    cancel() {
        this.complete();
    }
}
exports.default = ScanHandler;
ScanHandler.LOGOUT_TIMEOUT = Number.parseInt(process.env.LOGOUT_TIMEOUT);
//# sourceMappingURL=ScanHandler.js.map