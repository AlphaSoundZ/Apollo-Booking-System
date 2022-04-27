"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SoftSPI = require("rpi-softspi");
const Mfrc522 = require("mfrc522-rpi");
const logger_1 = require("./config/logger");
const ScanHandler_1 = require("./ScanHandler");
const WebSocketManager_1 = require("./lib/websockets/WebSocketManager");
const RegisterHandler_1 = require("./RegisterHandler");
class RFIDManager {
    /**
     * Initialize the manager
     * @param apiUrl URL of the backend server
     */
    constructor(api, registerMode) {
        this.socketManager = new WebSocketManager_1.default();
        this.listening = true;
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
        logger_1.default.info("Listening for rfid tags");
    }
    startReadCycle() {
        setInterval(this.readCycle.bind(this), RFIDManager.READ_CYCLE_LENGTH);
    }
    /**
     * Gets executed every read cycle
     */
    readCycle() {
        if (!this.listening)
            return;
        // Catch any errors occurring during chip read for better resistance
        try {
            // Reset the reader for new read
            this.reader.reset();
            // Find RFID chip
            let response = this.reader.findCard();
            if (!response || !response.status)
                return;
            // Read the chip uid
            response = this.reader.getUid();
            // Return if failed
            if (!response.status)
                return;
            // Generate UID from chip bytes
            const uid = response.data;
            const currentUid = uid[0].toString(16) +
                uid[1].toString(16) +
                uid[2].toString(16) +
                uid[3].toString(16);
            // Check for read timeout
            const timeBetween = Date.now() - this.lastScan;
            if (this.lastUid == currentUid && timeBetween < RFIDManager.READ_TIMEOUT)
                return;
            // Update last scan data
            this.lastUid = currentUid;
            this.lastScan = Date.now();
            logger_1.default.debug("Card read UID:", this.lastUid);
            // If in register mode, do not enter main routine
            if (this.registerMode) {
                this.lastHandler = new RegisterHandler_1.default(this.api);
                this.lastHandler.run(currentUid);
            }
            const handler = this.lastHandler;
            // Decide on what routine to run
            if (!handler || (handler && !handler.active && !handler.busy)) {
                this.lastHandler = new ScanHandler_1.default(this.socketManager, this.api);
                this.lastHandler.run(currentUid);
            }
            else if (handler && handler.active && !handler.busy) {
                handler.moreInput(currentUid);
                this.lastHandler = handler;
            }
            else if (handler && handler.active && handler.busy) {
                // Skipping, handler is currently busy
            }
            else {
                logger_1.default.warn("Unexpected edge case occurred. Last handler:", handler);
                handler === null || handler === void 0 ? void 0 : handler.cancel();
                this.lastHandler = null;
            }
        }
        catch (err) {
            this.socketManager.catchError(err, "Error occurred while reading uid");
        }
    }
}
exports.default = RFIDManager;
RFIDManager.READ_TIMEOUT = Number.parseInt(process.env.READ_TIMEOUT);
RFIDManager.READ_CYCLE_LENGTH = Number.parseInt(process.env.READ_CYCLE);
//# sourceMappingURL=RFIDManager.js.map