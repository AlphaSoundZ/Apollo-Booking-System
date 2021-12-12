import WebSocketManager from "./lib/WebSocketManager";
import * as SoftSPI from "rpi-softspi";
import * as Mfrc522 from "mfrc522-rpi";
import logger from "./config/logger";

export default class RFIDManager {
    private webSockets: WebSocketManager[];
    private apiUrl: string;
    private reader: Mfrc522;
    private listening: boolean;

    constructor(apiUrl: string) {
        this.apiUrl = apiUrl;
        this.listening = true;

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
        logger.debug("new cycle");

        if (this.listening) {
            logger.debug("Listening is disabled");
            return;
        }

        logger.debug("cycle is allowed");

        this.reader.reset();

        let response = this.reader.findCard();
        if (!response) {
            logger.debug("No card");
            return;
        }

        logger.debug("RFID detected. CardType: " + response.bitSize);

        response = this.reader.getUid();
        if (!response.status) {
            logger.warn("UID scan error");
            return;
        }

        const uid = response.data;
        logger.debug(
            "Card read UID:",
            uid[0].toString(16),
            uid[1].toString(16),
            uid[2].toString(16),
            uid[3].toString(16),
        );

        const memoryCapacity = this.reader.selectCard(uid);
        logger.debug("Card memory capacity:", memoryCapacity);

        const key = [0xff, 0xff, 0xff, 0xff, 0xff, 0xff];

        if (!this.reader.authenticate(8, key, uid)) {
            logger.warn("Authentication Error");
            return;
        }

        logger.debug("Block: 8 Data:", this.reader.getDataForBlock(8));

        this.reader.stopCrypto();
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
