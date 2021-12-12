import { WebSocket } from "ws";
import logger from "../config/logger";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WSEvent = { manager: WebSocketManager; data: any };
type WSCallback = (event: WSEvent) => Promise<void>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WSRequest = { event: string; data?: any };

class WSEventListener {
    eventName: string;
    callback: WSCallback;

    constructor(eventName: string, callback: WSCallback) {
        this.eventName = eventName;
        this.callback = callback;
    }
}

export { WSCallback, WSEvent, WSEventListener, WSRequest };

export default class WebSocketManager {
    ws: WebSocket;
    private listeners: WSEventListener[] = [];
    private onCloseListener: Array<() => void> = [];

    constructor(ws: WebSocket) {
        this.ws = ws;

        this.ws.on("close", () => {
            for (const listener of this.onCloseListener) {
                listener();
            }
        });

        this.ws.on("message", (data) => {
            let req: WSRequest;
            try {
                const response = JSON.parse(data as unknown as string);
                if (response.type !== "event") return;
                if (!response.event) throw new Error("No event specified");
                req = response;
            } catch (err) {
                logger.warn("Received invalid JSON object from websocket:", err);
                this.sendJSON({
                    type: "response",
                    success: false,
                    error: "INVALID_REQUEST",
                    message: "Received invalid JSON object",
                });
                return;
            }

            let eventFound = false;
            for (const listener of this.listeners) {
                if (listener.eventName !== req.event) continue;

                eventFound = true;
                if (req.data) listener.callback({ manager: this, data: req.data });
                else listener.callback({ manager: this, data: {} });
            }
            if (!eventFound) {
                logger.warn("Received invalid event from websocket:", req.event);
                this.sendJSON({
                    type: "response",
                    success: false,
                    error: "UNKNOWN_EVENT",
                    message: "The specified event was not found",
                });
            } else {
                logger.debug("Received event:", req.event);
            }
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sendJSON(value: any) {
        this.ws.send(JSON.stringify(value));
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    triggerEvent(eventName: string, data: any) {
        this.sendJSON({ event: eventName, data: data });
    }

    onclose(listener: () => void) {
        this.onCloseListener.push(listener);
    }

    listen(listener: WSEventListener) {
        this.listeners.push(listener);
    }
}
