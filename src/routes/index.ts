import * as express from "express";
import UI from "./ui";
import * as path from "path";

const route = express.Router();

// Create WebSocket endpoint
route.ws("/ws/ui", UI);

// Serve Client
const clientLocation = path.join(__dirname, "../../client/dist");
console.log(clientLocation);

// Add static UI endpoint (WARNING: UI first has to be build by navigating in the client directory and executing yarn build)
route.use(express.static(clientLocation));

export default route;
