import { WebSocket, RawData } from "ws";
import logger from "../config/logger";

type WSEvent = { manager: WebSocketManager; data: RawData };
type WSCallback = (event: WSEvent) => Promise<void>;
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

    constructor(ws: WebSocket) {
        this.ws = ws;

        this.ws.on("message", (data) => {
            let req: WSRequest;
            try {
                req = JSON.parse(data as unknown as string);
                if (!req.event) throw new Error("No event specified");
            } catch (err) {
                logger.warn("Received invalid JSON object from websocket:", err);
                this.sendJSON({
                    success: false,
                    error: "INVALID_REQUEST",
                    message: "Received invalid JSON object",
                });
                return;
            }

            for (const listener of this.listeners) {
                if (listener.eventName == req.event)
                    listener.callback({ manager: this, data: data });
            }
        });
    }

    sendJSON(value: any) {
        this.ws.send(JSON.stringify(value));
    }

    listen(listener: WSEventListener) {
        this.listeners.push(listener);
    }
}
