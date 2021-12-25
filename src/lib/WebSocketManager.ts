import { WebSocket } from "ws";
import logger from "../config/logger";

// Some type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WSEvent = { manager: WebSocketManager; data: any; respond: (data: any) => void };
type WSCallback = (event: WSEvent) => Promise<void>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WSRequest = { event: string; data?: any };

// Event listener that can be added to the manager
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

    /**
     * Initialize the manager
     * @param ws The websocket the manager is using
     */
    constructor(ws: WebSocket) {
        this.ws = ws;

        // Setup close listener
        this.ws.on("close", () => {
            for (const listener of this.onCloseListener) {
                listener();
            }
        });

        // Setup event listeners
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

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const respond = (data: any) => {
                    this.sendJSON({ type: "response", to: listener.eventName, data: data });
                };

                if (req.data) listener.callback({ manager: this, data: req.data, respond });
                else
                    listener.callback({
                        manager: this,
                        data: {},
                        respond,
                    });
            }
            if (!eventFound) {
                logger.warn("Received invalid event from websocket:", req.event);
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
