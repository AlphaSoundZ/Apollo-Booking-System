var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as ws from "ws";
import { createServer } from "http";
import * as dotenv from "dotenv";
import * as readline from "readline";
dotenv.config();
const names = {
    first: [
        "Max",
        "Felix",
        "Anton",
        "Mark",
        "Julius",
        "Sebastian",
        "Christian",
        "Timo",
        "Julian",
        "Juli",
        "Marie",
        "Ida",
        "Pauline",
        "Sonja",
        "Susanne",
    ],
    last: [
        "Müller",
        "Schmidt",
        "Schneider",
        "Fischer",
        "Weber",
        "Meyer",
        "Wagner",
        "Becker",
        "Schulz",
        "Hoffmann",
        "Koch",
        "Richter",
        "Bauer",
    ],
};
const classes = {
    years: [5, 6, 7, 8, 9, 10, 11, 12],
    subs: ["a", "b", "c", "d"],
};
function getRandomFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
}
const deviceTypes = ["Ipad", "Laptop"];
const port = Number.parseInt(process.env.UI_PORT);
const httpServer = createServer();
const server = new ws.WebSocketServer({ noServer: true });
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
function dispatchEvent(ws, eventName, data = {}) {
    ws.send(JSON.stringify({
        type: "event",
        event: eventName,
        data,
    }));
}
function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function questionLoop(ws) {
    rl.question("Action [User Input: UI, Device Input: DI]:", (answer) => __awaiter(this, void 0, void 0, function* () {
        switch (answer.toLowerCase()) {
            case "ui":
                dispatchEvent(ws, "gettingChipInfo");
                yield wait(200);
                const userId = Math.floor(Math.random() * 1000);
                const history = [];
                for (let i = 0; i < Math.floor(Math.random() * 10); i++) {
                    const returned = Math.floor(Math.random() * 100000);
                    history.push({
                        device_id: Math.floor(Math.random() * 1000),
                        device_type: Math.random() > 0.5 ? "Ipad" : "Laptop",
                        user_id: userId,
                        time_stamp_1: new Date().getTime() - returned,
                        time_stamp_2: new Date().getTime() - returned - Math.floor(Math.random() * 100000),
                    });
                }
                dispatchEvent(ws, "userInfo", {
                    user: {
                        vorname: getRandomFromArray(names.first),
                        nachname: getRandomFromArray(names.last),
                        user_id: userId,
                        klasse: Math.random() > 0.9
                            ? 1
                            : getRandomFromArray(classes.years) +
                                getRandomFromArray(classes.subs),
                        history,
                    },
                });
                questionLoop(ws);
                break;
            default:
                questionLoop(ws);
        }
    }));
}
server.on("connection", (ws) => {
    console.log("New UI connection established.");
    try {
        ws.on("message", (data) => {
            const req = JSON.parse(data.toString());
            if (req.type !== "event")
                return;
            if (req.event == "ping") {
                ws.send(JSON.stringify({ type: "response", to: "ping", data: true }));
            }
        });
        ws.on("close", (code) => {
            console.log("Connection closed:", code);
        });
    }
    catch (err) {
        console.error("Error handling message:", err);
    }
    questionLoop(ws);
});
httpServer.on("upgrade", (request, socket, head) => {
    server.handleUpgrade(request, socket, head, (ws) => {
        server.emit("connection", ws, request);
    });
});
httpServer.listen(port, null, null, () => {
    console.log("Mockup server listening on port", port);
});
