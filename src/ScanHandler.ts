import logger from "./config/logger";
import Handler from "./Handler";
import API, { BookingResponse, ResponseType } from "./lib/API";
import DisplayError, { ReturnTarget } from "./lib/DisplayError";
import { UIState } from "./lib/UIState";
import WebSocketManager from "./lib/websockets/WebSocketManager";

export default class ScanHandler implements Handler {
    private static LOGOUT_TIMEOUT = Number.parseInt(process.env.LOGOUT_TIMEOUT);

    public active = false;
    public busy = false;
    public uid: string | null = null;

    private socketManager: WebSocketManager;
    private api: API;
    private logoutTimeout: NodeJS.Timeout | null = null;

    constructor(socketManager: WebSocketManager, api: API) {
        this.socketManager = socketManager;
        this.api = api;
    }

    public async run(uid: string) {
        if (this.active) return;

        this.active = true;
        this.busy = true;

        this.socketManager.sendUI(UIState.GETTING_CHIP_INFO);

        let info: BookingResponse;
        try {
            info = await this.api.unknownActionForUid(uid);
        } catch (err) {
            if (API.isResponseError(err))
                this.socketManager.sendError(new DisplayError(err.response, err.message));
            else this.socketManager.catchError(err, "Error occurred while checking uid.");

            this.complete();
            return;
        }
        if (info.response == ResponseType.RETURN_SUCCESS) {
            // UUID is device and specified device got returned
            logger.info(`Device returned (ID: ${info.data.device.device_id})`);
            this.socketManager.sendUI(UIState.DEVICE_RETURNED);
            this.complete();
        } else if (info.response == ResponseType.USER_INFO) {
            // UUID is user and info got returned
            this.uid = uid;
            this.socketManager.sendUI(UIState.USER_INFO, { user: info.data.user });
            this.complete(true, info.data.user.multiuser);
        } else if (info.response.error) {
            // An server error occurred
            this.socketManager.sendError(
                new DisplayError(info.response, info.message, ReturnTarget.HOME),
            );
            this.complete();
        } else {
            // Unexpected result
            this.socketManager.sendError(
                new DisplayError(
                    ResponseType.UNEXPECTED_ERROR,
                    "Unknown API response.",
                    ReturnTarget.HOME,
                ),
            );
            this.complete();
        }
    }

    public async moreInput(uid: string) {
        if (!this.active || this.busy || this.uid == null) return;

        this.busy = true;

        if (uid == this.uid) {
            // Manual logout
            logger.info("User manually logged out");
            this.socketManager.sendUI(UIState.USER_LOGOUT);
            this.complete();
            return;
        }

        this.socketManager.sendUI(UIState.DEVICE_BOOKING_LOADING);

        let booking: BookingResponse;
        try {
            booking = await this.api.book(this.uid, uid);
        } catch (err) {
            if (API.isResponseError(err)) {
                logger.info(
                    `Booking failed [caught exception] (${err.response.identifier}): ${err.message}`,
                );
                this.socketManager.sendError(
                    new DisplayError(err.response, err.message, ReturnTarget.USER_HOME),
                );
            } else {
                this.socketManager.catchError(
                    err,
                    "Error occurred while booking device.",
                    ReturnTarget.USER_HOME,
                );
            }
            this.complete(true);
            return;
        }

        if (booking.response.error) {
            logger.info(`Booking failed (${booking.response.identifier}): ${booking.message}`);
            this.socketManager.sendError(
                new DisplayError(booking.response, booking.message, ReturnTarget.USER_HOME),
            );
            this.complete(true);
            return;
        }

        logger.info(`Booking completed (ID: ${booking.data.device.device_id})`);
        this.socketManager.sendUI(
            UIState.DEVICE_BOOKING_COMPLETED,
            {},
            booking.data.user.multiuser ? ReturnTarget.USER_HOME : ReturnTarget.HOME,
        );
        this.complete(booking.data.user.multiuser);
    }

    private complete(moreActionsAllowed = false, infiniteLogoutTimeout = false) {
        this.busy = false;
        this.active = moreActionsAllowed;

        // Handling logout timeout
        if (this.logoutTimeout) clearTimeout(this.logoutTimeout);
        if (moreActionsAllowed && !infiniteLogoutTimeout) {
            this.logoutTimeout = setTimeout(() => {
                this.socketManager.sendUI(UIState.USER_LOGOUT);
                this.complete();
            }, ScanHandler.LOGOUT_TIMEOUT);
        }
    }

    public cancel() {
        this.complete();
    }
}
