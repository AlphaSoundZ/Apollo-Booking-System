import { WSEventListener } from "../../lib/websockets/WebSocketHandler";

// Ping event
export default new WSEventListener("ping", async (event) => {
    // Respond to keep connection alive
    event.respond(true);
});
