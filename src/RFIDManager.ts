import WebSocketManager from "./lib/WebSocketManager";
import * as SoftSPI from "rpi-softspi";
import * as Mfrc522 from "mfrc522-rpi";
import logger from "./config/logger";
import axios from "axios";

export default class RFIDManager {
    private webSockets: WebSocketManager[] = [];
    private apiUrl: string;
    private reader: Mfrc522;
    private listening = true;
    private lastScan: number;
    private lastUid: string;
    private subRoutineRunning = false;
    private runIfSub: (uid: string) => void;

    /**
     * Initialize the manager
     * @param apiUrl URL of the backend server
     */
    constructor(apiUrl: string) {
        this.apiUrl = apiUrl;

        // Create spi
        const softSPI = new SoftSPI({
            clock: 23,
            mosi: 19,
            miso: 21,
            client: 24,
        });
        // Initialize RFID reader
        this.reader = new Mfrc522(softSPI).setResetPin(22);

        // Start the read cycle interval
        setInterval(this.readCycle.bind(this), Number.parseInt(process.env.READ_CYCLE));
        logger.info("Listening for rfid tags");
    }

    /**
     * Gets executed every read cycle
     */
    private readCycle(): void {
        if (!this.listening) return;

        // Catch any errors occurring during chip read for better resistance
        try {
            // Reset the reader for new read
            this.reader.reset();

            // Find RFID chip
            let response = this.reader.findCard();
            if (!response) return;

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
            if (
                this.lastScan == currentUid &&
                Date.now() - this.lastScan < Number.parseInt(process.env.READ_TIMEOUT)
            ) {
                logger.debug("Timeout not passed. Skipping");
                return;
            }

            // Update last scan data
            this.lastUid = currentUid;
            this.lastScan = Date.now();

            logger.debug("Card read UID:", this.lastUid);

            // Decide on what routine to run
            if (!this.subRoutineRunning) {
                this.subRoutine();
            } else {
                if (this.runIfSub) this.runIfSub(this.lastUid);
            }
        } catch (err) {
            this.catchError(err, "Error occurred while reading uid");
        }
    }

    /**
     * Reset routine
     */
    private freeReader(): void {
        this.subRoutineRunning = false;
        this.listening = true;
        this.runIfSub = undefined;
    }

    /**
     * default first routine
     */
    private async subRoutine(): Promise<void> {
        // Catch error for better resistance
        try {
            this.subRoutineRunning = true;
            this.listening = false;

            const uid = this.lastUid;
            // Update UI
            this.sendWebSocket("gettingChipInfo");

            // Get chip info from server
            const chipInfo = await this.makeApiRequest({ rfid1: uid });
            const statusCode = chipInfo.response;
            logger.debug("Chip info status:", statusCode, `(${chipInfo.message.trim()})`);

            // Decide on next routine step
            if (statusCode == 1) {
                this.sendWebSocket("deviceReturned");
                this.freeReader();
                return;
            } else if (statusCode > 2 || statusCode < 1) {
                this.sendError(chipInfo);
                this.freeReader();
                return;
            } else {
                this.sendWebSocket("userInfo", { user: chipInfo.user });
                this.makeBooking(uid);
            }
        } catch (err) {
            this.catchError(err, "Error occurred while checking uid");
        }
    }

    /**
     * Initialize booking routine
     * @param uid UID of the user
     */
    private async makeBooking(uid: string): Promise<void> {
        try {
            this.listening = true;

            // Timeout before logout
            const logoutTimeout = setTimeout(() => {
                this.sendWebSocket("userLogout");
                this.freeReader();
                logger.debug("User automatically logged out");
            }, Number.parseInt(process.env.LOGOUT_TIMEOUT));

            // Set seconds routine
            this.runIfSub = async (newUid) => {
                this.listening = false;

                // Check for manual logout and logout if so
                if (newUid == uid) {
                    this.sendWebSocket("userLogout");
                    this.freeReader();
                    clearInterval(logoutTimeout);
                    logger.debug("User logged out");
                    return;
                }

                // Send booking to server
                const booking = await this.makeApiRequest({ rfid1: uid, rfid2: newUid });
                logger.debug(
                    "Booking info status:",
                    booking.response,
                    `(${booking.message.trim()})`,
                );

                // Check booking success
                if (booking.response > 2) {
                    this.sendError(booking);
                    this.freeReader();
                    return;
                }

                // Update UI
                this.sendWebSocket("bookingCompleted");
                this.freeReader();
            };
        } catch (err) {
            this.catchError(err, "Error occurred while booking device");
        }
    }

    /**
     * Pass the error to UI and log
     * @param err The error thrown
     * @param message A custom log message
     */
    private catchError(err: Error, message: string): void {
        logger.error(message + ":", err);
        try {
            this.sendError({ response: 8, message: err.message });
        } catch (uErr) {
            logger.error("Error occurred while reporting error to UI:", uErr);
        }
    }

    /**
     * Send error to UI
     * @param req Server error
     */
    private async sendError(req: { response: number; message: string }): Promise<void> {
        let statusCode = req.response;
        if (statusCode < 3) statusCode = 8;
        this.sendWebSocket("error", { code: statusCode, message: req.message });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private async makeApiRequest(data: any) {
        return (
            await axios.get(this.apiUrl + "?" + new URLSearchParams(data).toString(), {
                responseType: "json",
            })
        ).data;
    }

    /**
     * Send event to UI
     * @param eventName Event name for UI
     * @param data Event data for UI
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private sendWebSocket(eventName: string, data: any = {}): void {
        for (const ws of this.webSockets) {
            ws.triggerEvent(eventName, data);
        }
    }

    /**
     * Add a WebSocket to the manager
     * @param ws WebSocket to be added
     */
    public addWebSocket(ws: WebSocketManager): void {
        ws.onclose(() => {
            this.removeWebSocket(ws);
        });
        this.webSockets.push(ws);
        logger.debug("New ui connection");
    }

    /**
     * Remove a WebSocket from the manager
     * @param ws WebSocket to be removed
     */
    public removeWebSocket(ws: WebSocketManager): void {
        this.webSockets.splice(this.webSockets.indexOf(ws));

        logger.debug("Lost UI connection");
    }
}
