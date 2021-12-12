import WebSocketManager from "./lib/WebSocketManager";

export default class RFIDManager {
    private webSockets: WebSocketManager[];
    private apiUrl: string;

    constructor(apiUrl: string) {
        this.apiUrl = apiUrl;
    }

    addWebSocket(ws: WebSocketManager) {
        ws.onclose(() => {
            this.removeWebSocket(ws);
        });
        this.webSockets.push(ws);
    }

    removeWebSocket(ws: WebSocketManager) {
        this.webSockets.splice(this.webSockets.indexOf(ws));
    }
}
