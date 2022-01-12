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

function getRandomFromArray(array: any[]) {
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

function dispatchEvent(ws: ws.WebSocket, eventName: string, data: any = {}) {
    ws.send(
        JSON.stringify({
            type: "event",
            event: eventName,
            data,
        }),
    );
}

function wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function questionLoop(ws: ws.WebSocket) {
    rl.question("Action [User Input: UI, Device Input: DI]:", async (answer) => {
        switch (answer.toLowerCase()) {
            case "ui":
                dispatchEvent(ws, "gettingChipInfo");

                await wait(200);

                const userId = Math.floor(Math.random() * 1000);
                const history = [];
                for (let i = 0; i < Math.floor(Math.random() * 10); i++) {
                    const returned = Math.floor(Math.random() * 100000);
                    history.push({
                        device_id: Math.floor(Math.random() * 1000),
                        device_type: Math.random() > 0.5 ? "Ipad" : "Laptop",
                        user_id: userId,
                        time_stamp_1: new Date().getTime() - returned,
                        time_stamp_2:
                            new Date().getTime() - returned - Math.floor(Math.random() * 100000),
                    });
                }

                dispatchEvent(ws, "userInfo", {
                    user: {
                        vorname: getRandomFromArray(names.first),
                        nachname: getRandomFromArray(names.last),
                        user_id: userId,
                        klasse:
                            Math.random() > 0.9
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
    });
}

server.on("connection", (ws) => {
    console.log("New UI connection established.");
    try {
        ws.on("message", (data) => {
            const req = JSON.parse(data.toString());
            if (req.type !== "event") return;

            if (req.event == "ping") {
                ws.send(JSON.stringify({ type: "response", to: "ping", data: true }));
            }
        });

        ws.on("close", (code) => {
            console.log("Connection closed:", code);
        });
    } catch (err) {
        console.error("Error handling message:", err);
    }

    questionLoop(ws);
});

httpServer.on("upgrade", (request, socket: any, head) => {
    server.handleUpgrade(request, socket, head, (ws) => {
        server.emit("connection", ws, request);
    });
});

httpServer.listen(port, null, null, () => {
    console.log("Mockup server listening on port", port);
});
