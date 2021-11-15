import * as express from "express";
import UI from "./ui";

const route = express.Router();

route.ws("/ws/ui", UI);

// Serve UI
route.get("/", express.static("../../client/dist"));

export default route;
