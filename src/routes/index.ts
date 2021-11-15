import * as express from "express";
import UI from "./ui";
import * as path from "path";

const route = express.Router();

route.ws("/ws/ui", UI);

// Serve Client
const clientLocation = path.join(__dirname, "../../client/dist");
console.log(clientLocation);
route.use(express.static(clientLocation));

export default route;
