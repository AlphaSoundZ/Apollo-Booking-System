import WebSocketHandler from "./WebSocketHandler";
import logger from "../../config/logger";
import DisplayError, { ReturnTarget } from "../DisplayError";
import { ResponseType } from "../API";
import { UIState } from "../UIState";

/**
 * Manages all websocket connections
 */
export default class WebSocketManager {
    public sockets: Array<WebSocketHandler> = [];

    /**
     * Add a WebSocket to the manager
     * @param ws WebSocket to be added
     */
    public addWebSocket(ws: WebSocketHandler): void {
        ws.onclose(() => {
            this.removeWebSocket(ws);
        });
        this.sockets.push(ws);
        logger.debug("New ui connection");
    }

    /**
     * Remove a WebSocket from the manager
     * @param ws WebSocket to be removed
     */
    public removeWebSocket(ws: WebSocketHandler): void {
        this.sockets.splice(this.sockets.indexOf(ws));

        logger.debug("Lost UI connection");
    }

    /**
     * Send UI state to UI
     * @param state UI state for UI
     * @param data data for UI
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public async sendUI(state: UIState, data: any = {}, returnTarget?: ReturnTarget) {
        this.send("uistate", { state, returnTarget, data });
    }

    /**
     * Send event to UI
     * @param eventName Event name for UI
     * @param data Event data for UI
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public async send(eventName: string, data: any = {}) {
        for (const ws of this.sockets) {
            await ws.triggerEvent(eventName, data);
        }
    }

    /**
     * Send error to UI
     * @param req Server error
     */
    public async sendError(error: DisplayError) {
        await this.send("error", {
            code: error.response.identifier,
            message: error.message,
            redirectTarget: error.returnTarget,
        });
    }

    /**
     * Pass the error to UI and log
     * @param err The error thrown
     * @param message A custom log message
     */
    public async catchError(err: Error, message: string, returnTarget = ReturnTarget.HOME) {
        logger.error(message + ":", err);
        try {
            await this.sendError(
                new DisplayError(ResponseType.UNEXPECTED_ERROR, message, returnTarget),
            );
        } catch (uErr) {
            logger.error("Error occurred while reporting error to UI:", uErr);
        }
    }
}
