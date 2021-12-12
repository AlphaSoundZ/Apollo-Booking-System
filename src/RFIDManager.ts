import WebSocketManager from "./lib/WebSocketManager";
import * as SoftSPI from "rpi-softspi";
import * as Mfrc522 from "mfrc522-rpi";
import logger from "./config/logger";

export default class RFIDManager {
    private webSockets: WebSocketManager[];
    private apiUrl: string;
    private reader: Mfrc522;
    private listening = true;
    private lastUid: string;
    private subRoutineRunning = false;

    constructor(apiUrl: string) {
        this.apiUrl = apiUrl;

        const softSPI = new SoftSPI({
            clock: 23,
            mosi: 19,
            miso: 21,
            client: 24,
        });
        this.reader = new Mfrc522(softSPI).setResetPin(22);

        setInterval(this.readCycle.bind(this), 250);
        logger.info("Listening for rfid tags");
    }

    readCycle() {
        if (!this.listening) return;

        this.reader.reset();

        let response = this.reader.findCard();
        if (!response) return;

        response = this.reader.getUid();
        if (!response.status) return;

        const uid = response.data;
        logger.debug(
            "Card read UID:",
            uid[0].toString(16),
            uid[1].toString(16),
            uid[2].toString(16),
            uid[3].toString(16),
        );

        this.reader.stopCrypto();
    }

    addWebSocket(ws: WebSocketManager) {
        ws.onclose(() => {
            this.removeWebSocket(ws);
        });
        this.webSockets.push(ws);

        logger.debug("New ui connection");
    }

    removeWebSocket(ws: WebSocketManager) {
        this.webSockets.splice(this.webSockets.indexOf(ws));

        logger.debug("UI connection removed");
    }
}
