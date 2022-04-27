"use strict";
exports.__esModule = true;
var SoftSPI = require("rpi-softspi");
var Mfrc522 = require("mfrc522-rpi");
var logger_1 = require("./config/logger");
var ScanHandler_1 = require("./ScanHandler");
var WebSocketManager_1 = require("./lib/websockets/WebSocketManager");
var RFIDManager = /** @class */ (function () {
    /**
     * Initialize the manager
     * @param apiUrl URL of the backend server
     */
    function RFIDManager(api) {
        this.socketManager = new WebSocketManager_1["default"]();
        this.listening = true;
        this.api = api;
        // Create spi
        var softSPI = new SoftSPI({
            clock: 23,
            mosi: 19,
            miso: 21,
            client: 24
        });
        // Initialize RFID reader
        this.reader = new Mfrc522(softSPI).setResetPin(22).setBuzzerPin(18);
        // Start the read cycle interval
        this.startReadCycle();
        logger_1["default"].info("Listening for rfid tags");
    }
    RFIDManager.prototype.startReadCycle = function () {
        setInterval(this.readCycle.bind(this), RFIDManager.READ_CYCLE_LENGTH);
    };
    /**
     * Gets executed every read cycle
     */
    RFIDManager.prototype.readCycle = function () {
        var _a;
        if (!this.listening)
            return;
        // Catch any errors occurring during chip read for better resistance
        try {
            // Reset the reader for new read
            this.reader.reset();
            // Find RFID chip
            var response = this.reader.findCard();
            if (!response || !response.status)
                return;
            // Read the chip uid
            response = this.reader.getUid();
            // Return if failed
            if (!response.status)
                return;
            // Generate UID from chip bytes
            var uid = response.data;
            var currentUid = uid[0].toString(16) +
                uid[1].toString(16) +
                uid[2].toString(16) +
                uid[3].toString(16);
            // Check for read timeout
            var timeBetween = Date.now() - this.lastScan;
            if (this.lastUid == currentUid && timeBetween < RFIDManager.READ_TIMEOUT) {
                logger_1["default"].debug("Timeout not passed. Skipping");
                return;
            }
            // Update last scan data
            this.lastUid = currentUid;
            this.lastScan = Date.now();
            logger_1["default"].debug("Card read UID:", this.lastUid);
            // Decide on what routine to run
            if (!this.lastHandler ||
                (this.lastHandler && !this.lastHandler.active && !this.lastHandler.busy)) {
                this.lastHandler = new ScanHandler_1["default"](this.socketManager, this.api);
                this.lastHandler.run(currentUid);
            }
            else if (this.lastHandler && this.lastHandler.active && !this.lastHandler.busy) {
                this.lastHandler.moreInput(currentUid);
            }
            else if (this.lastHandler && this.lastHandler.active && this.lastHandler.busy) {
                // Skipping, handler is currently busy
            }
            else {
                logger_1["default"].warn("Unexpected edge case occurred");
                (_a = this.lastHandler) === null || _a === void 0 ? void 0 : _a.cancel();
                this.lastHandler = null;
            }
        }
        catch (err) {
            this.socketManager.catchError(err, "Error occurred while reading uid");
        }
    };
    RFIDManager.READ_TIMEOUT = Number.parseInt(process.env.READ_TIMEOUT);
    RFIDManager.READ_CYCLE_LENGTH = Number.parseInt(process.env.READ_CYCLE);
    return RFIDManager;
}());
exports["default"] = RFIDManager;
