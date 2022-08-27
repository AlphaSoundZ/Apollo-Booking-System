import * as SoftSPI from "rpi-softspi";
import * as Mfrc522 from "mfrc522-rpi";
import logger from "./config/logger";
import ScanHandler from "./ScanHandler";
import WebSocketManager from "./lib/websockets/WebSocketManager";
import API from "./lib/API";
import RegisterHandler from "./RegisterHandler";
import Handler from "./Handler";

export default class RFIDManager {
    private static READ_TIMEOUT = Number.parseInt(process.env.READ_TIMEOUT);
    private static READ_CYCLE_LENGTH = Number.parseInt(process.env.READ_CYCLE);

    public readonly socketManager = new WebSocketManager();
    public readonly api: API;

    private readonly registerMode: boolean;

    private reader: Mfrc522;
    private listening = true;
    private lastScan: number;
    private lastUid: string;
    private lastHandler: Handler;

    /**
     * Initialize the manager
     * @param api API object
     * @param registerMode enable for device registration
     */
    constructor(api: API, registerMode: boolean) {
        this.api = api;
        this.registerMode = registerMode;

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
        this.readCycle();
        setInterval(this.readCycle.bind(this), RFIDManager.READ_CYCLE_LENGTH);
    }

    /**
     * Gets executed every read cycle
     */
    private readCycle() {
        (() => {
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

                // If in register mode, do not enter main routine
                if (this.registerMode) {
                    this.lastHandler = new RegisterHandler(this.api);
                    this.lastHandler.run(currentUid);
                }
                const handler = this.lastHandler as ScanHandler;

                // Decide on what routine to run
                if (!handler || (handler && !handler.active && !handler.busy)) {
                    this.lastHandler = new ScanHandler(this.socketManager, this.api);
                    this.lastHandler.run(currentUid);
                } else if (handler && handler.active && !handler.busy) {
                    handler.moreInput(currentUid);
                    this.lastHandler = handler;
                } else if (handler && handler.active && handler.busy) {
                    // Skipping, handler is currently busy
                } else {
                    logger.warn("Unexpected edge case occurred. Last handler:", handler);
                    handler?.cancel();
                    this.lastHandler = null;
                }
            } catch (err) {
                this.socketManager.catchError(err, "Error occurred while reading uid");
            }
        })();

        // Set timeout so that the cycle begins again after some period
        setTimeout(this.readCycle.bind(this), RFIDManager.READ_CYCLE_LENGTH);
    }
}
