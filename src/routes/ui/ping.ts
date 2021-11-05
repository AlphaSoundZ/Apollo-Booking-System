import { WSEventListener } from "../../lib/WebSocketManager";

export default new WSEventListener("ping", async (event) => {
    event.manager.sendJSON({
        type: "response",
        success: true,
    });
});
