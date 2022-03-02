import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import "@/assets/fonts/Roboto.css";
import "@/assets/fonts/MaterialIcons.css";
import UIState from "./lib/UIState";
import { ReturnTarget } from "./lib/ReturnTarget";

Vue.config.productionTip = false;

export enum ConnectionStatus {
    CONNECTING,
    CONNECTED,
    DISCONNECTED,
}

interface Root {
    websocket: null | WebSocket;
    lastUser: null | any;
    connectionStatus: ConnectionStatus;
    connectedSince: number;
    lastRedirectTimeout: number;
}

class Event {
    public name: string;
    public data?: any;

    constructor(name: string, data?: any) {
        this.name = name;
        this.data = data;
    }
}

interface UIStateEvent {
    state: UIState;
    returnTarget?: ReturnTarget;
    data: any;
}

new Vue({
    router,
    render: (h) => h(App),
    data: {
        websocket: null,
        lastUser: null,
        connectionStatus: ConnectionStatus.CONNECTING,
        connectedSince: new Date().getTime(),
        lastRedirectTimeout: -1,
    } as Root,
    mounted() {
        this.websocketSetup();
    },
    methods: {
        websocketSetup() {
            // Check for dev mode
            const devMode = process.env.NODE_ENV === "development";

            if (this.connectionStatus != ConnectionStatus.CONNECTING)
                this.connectionStatus = ConnectionStatus.DISCONNECTED;
            this.navPage("Waiting");

            let url = "ws://" + window.location.host + "/ws/ui";
            if (new URLSearchParams(window.location.search).has("host")) {
                url = new URLSearchParams(window.location.search).get("host") || url;
            } else if (devMode) {
                url = "ws://127.0.0.1:8081/ws/ui";
            }

            console.log("Opening websocket on:", url);
            this.websocket = new WebSocket(url);

            // Ping to check if server is responsive
            let pingInterval: number;
            let pingTimeout = 0;
            this.websocket.onopen = () => {
                console.log("Websocket connected");
                this.connectionStatus = ConnectionStatus.CONNECTED;
                this.connectedSince = new Date().getTime();
                pingInterval = setInterval(() => {
                    this.websocket?.send(JSON.stringify({ type: "event", event: "ping" }));
                    pingTimeout = setTimeout(() => {
                        console.log("No response from connection! Reopening connection");
                        this.websocketSetup();
                    }, 3000);
                }, 15000);
            };

            // Reconnect when connection ends
            this.websocket.onclose = () => {
                this.connectionStatus = ConnectionStatus.DISCONNECTED;
                if (pingInterval) clearInterval(pingInterval);
                if (this.websocket) {
                    this.websocket.close();
                }
                console.log("Connection lost, reconnecting");
                this.websocketSetup();
            };

            this.websocket.onmessage = (ev) => {
                const res = JSON.parse(ev.data);
                if (res.type == "response" && res.to == "ping") {
                    clearTimeout(pingTimeout);
                    return;
                }
                if (res.type == "event") {
                    const event = new Event(res.event, res.data);

                    switch (event.name) {
                        case "uistate": {
                            const uiEvent = event.data;
                            uiEvent.state = UIState.getByIdentifier(uiEvent.state);
                            console.log(uiEvent.state);
                            this.triggerUIStateEvent(uiEvent as UIStateEvent);

                            break;
                        }
                        case "error": {
                            this.triggerUIStateEvent(
                                {
                                    state: UIState.ERROR,
                                    returnTarget: event.data.returnTarget,
                                    data: { message: event.data.message },
                                },
                                5000,
                            );
                            break;
                        }
                    }
                }

                //console.log(JSON.parse(ev.data))
            };
        },
        triggerUIStateEvent(event: UIStateEvent, returnDelay = 3000) {
            if (this.lastRedirectTimeout != -1) clearTimeout(this.lastRedirectTimeout);

            if (event.state == UIState.USER_INFO) this.lastUser = event.data;
            if (event.state == UIState.USER_LOGOUT) event.returnTarget = ReturnTarget.HOME;
            if ((event.state = UIState.DEVICE_RETURNED)) event.returnTarget = ReturnTarget.HOME;

            this.navPage(event.state.pageName, { ...event.data, ...event.state.props });
            if (event.returnTarget) {
                this.lastRedirectTimeout = setTimeout(() => {
                    switch (event.returnTarget) {
                        case ReturnTarget.USER_HOME: {
                            if (this.lastUser)
                                this.navPage(UIState.USER_INFO.pageName, this.lastUser);
                            else this.navPage(UIState.HOME.pageName);
                            break;
                        }
                        default: {
                            this.navPage(UIState.HOME.pageName);
                            break;
                        }
                    }
                }, returnDelay);
            }
        },
        navPage(pageName: string, data: any = {}) {
            this.$router.replace({ name: pageName, params: data }).catch((err) => {
                // Silently ignore this error when its an router error. We don't care about redundant navigation
                if (!err._isRouter) throw err;
            });
        },
    },
}).$mount("#app");
