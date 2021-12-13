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
    private lastUid: string;
    private subRoutineRunning = false;
    private runIfSub: (uid: string) => void;

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

    private readCycle() {
        if (!this.listening) return;

        try {
            this.reader.reset();

            let response = this.reader.findCard();
            if (!response) return;

            response = this.reader.getUid();
            if (!response.status) return;

            const uid = response.data;
            this.lastUid =
                uid[0].toString(16) +
                uid[1].toString(16) +
                uid[2].toString(16) +
                uid[3].toString(16);

            logger.debug("Card read UID:", this.lastUid);

            if (!this.subRoutineRunning) {
                this.subRoutine();
            } else {
                if (this.runIfSub) this.runIfSub(this.lastUid);
            }
        } catch (err) {
            this.catchError(err, "Error occurred while reading uid");
        }
    }

    private freeReader() {
        this.subRoutineRunning = false;
        this.listening = true;
        this.runIfSub = undefined;
    }

    private async subRoutine() {
        try {
            this.subRoutineRunning = true;
            this.listening = false;

            const uid = this.lastUid;
            this.sendWebSocket("gettingChipInfo");

            const chipInfo = await this.makeApiRequest({ rfid1: uid });
            const statusCode = chipInfo.response;
            logger.debug("Chip info status:", statusCode, `(${chipInfo.message.trim()})`);

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

    private async makeBooking(uid) {
        try {
            this.listening = true;

            const logoutTimeout = setTimeout(() => {
                this.sendWebSocket("userLogout");
                this.freeReader();
                logger.debug("User automatically logged out");
            }, 15000);

            this.runIfSub = async (newUid) => {
                this.listening = false;

                if (newUid == uid) {
                    this.sendWebSocket("userLogout");
                    this.freeReader();
                    clearInterval(logoutTimeout);
                    logger.debug("User logged out");
                    return;
                }

                const booking = await this.makeApiRequest({ rfid1: uid, rfid2: newUid });
                logger.debug(
                    "Booking info status:",
                    booking.response,
                    `(${booking.message.trim()})`,
                );

                if (booking.response > 2) {
                    this.sendError(booking);
                    this.freeReader();
                    return;
                }
                this.sendWebSocket("bookingCompleted");
                this.freeReader();
            };
        } catch (err) {
            this.catchError(err, "Error occurred while booking device");
        }
    }

    private catchError(err, message) {
        logger.error(message + ":", err);
        try {
            this.sendError({ response: 8, message: err });
        } catch (uErr) {
            logger.error("Error occurred while reporting error to UI:", uErr);
        }
    }

    private async sendError(req: { response: number; message: string }) {
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private sendWebSocket(eventName: string, data: any = {}) {
        for (const ws of this.webSockets) {
            ws.triggerEvent(eventName, data);
        }
    }

    public addWebSocket(ws: WebSocketManager) {
        ws.onclose(() => {
            this.removeWebSocket(ws);
        });
        this.webSockets.push(ws);
        logger.debug("New ui connection");
    }

    public removeWebSocket(ws: WebSocketManager) {
        this.webSockets.splice(this.webSockets.indexOf(ws));

        logger.debug("Lost UI connection");
    }
}
