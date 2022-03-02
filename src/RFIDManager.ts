import * as SoftSPI from "rpi-softspi";
import * as Mfrc522 from "mfrc522-rpi";
import logger from "./config/logger";
import ScanHandler from "./ScanHandler";
import WebSocketManager from "./lib/websockets/WebSocketManager";
import API from "./lib/API";

export default class RFIDManager {
    private static READ_TIMEOUT = Number.parseInt(process.env.READ_TIMEOUT);
    private static READ_CYCLE_LENGTH = Number.parseInt(process.env.READ_CYCLE);

    public readonly socketManager = new WebSocketManager();
    public readonly api: API;

    private reader: Mfrc522;
    private listening = true;
    private lastScan: number;
    private lastUid: string;
    private lastHandler: ScanHandler;

    /**
     * Initialize the manager
     * @param apiUrl URL of the backend server
     */
    constructor(api: API) {
        this.api = api;

        // Create spi
        const softSPI = new SoftSPI({
            clock: 23,
            mosi: 19,
            miso: 21,
            client: 24,
        });
        // Initialize RFID reader
        this.reader = new Mfrc522(softSPI).setResetPin(22).setBuzzerPin(18);

        // Start the read cycle interval
        this.startReadCycle();
        logger.info("Listening for rfid tags");
    }

    private startReadCycle() {
        setInterval(this.readCycle.bind(this), RFIDManager.READ_CYCLE_LENGTH);
    }

    /**
     * Gets executed every read cycle
     */
    private readCycle() {
        if (!this.listening) return;

        // Catch any errors occurring during chip read for better resistance
        try {
            // Reset the reader for new read
            this.reader.reset();

            // Find RFID chip
            let response = this.reader.findCard();
            if (!response || !response.status) return;

            // Read the chip uid
            response = this.reader.getUid();

            // Return if failed
            if (!response.status) return;

            // Generate UID from chip bytes
            const uid = response.data;
            const currentUid =
                uid[0].toString(16) +
                uid[1].toString(16) +
                uid[2].toString(16) +
                uid[3].toString(16);

            // Check for read timeout
            const timeBetween = Date.now() - this.lastScan;
            if (this.lastUid == currentUid && timeBetween < RFIDManager.READ_TIMEOUT) return;

            // Update last scan data
            this.lastUid = currentUid;
            this.lastScan = Date.now();

            logger.debug("Card read UID:", this.lastUid);

            // Decide on what routine to run
            if (
                !this.lastHandler ||
                (this.lastHandler && !this.lastHandler.active && !this.lastHandler.busy)
            ) {
                this.lastHandler = new ScanHandler(this.socketManager, this.api);
                this.lastHandler.run(currentUid);
            } else if (this.lastHandler && this.lastHandler.active && !this.lastHandler.busy) {
                this.lastHandler.moreInput(currentUid);
            } else if (this.lastHandler && this.lastHandler.active && this.lastHandler.busy) {
                // Skipping, handler is currently busy
            } else {
                logger.warn("Unexpected edge case occurred. Last handler:", this.lastHandler);
                this.lastHandler?.cancel();
                this.lastHandler = null;
            }
            logger.debug("Current handler:", this.lastHandler);
        } catch (err) {
            this.socketManager.catchError(err, "Error occurred while reading uid");
        }
    }
}
