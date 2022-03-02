import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import "@/assets/fonts/Roboto.css";
import "@/assets/fonts/MaterialIcons.css";

Vue.config.productionTip = false;

new Vue({
    router,
    render: (h) => h(App),
    data: {
        websocket: null,
        pingTimeout: 0,
        lastUser: null,
        connected: false,
    } as { websocket: null | WebSocket; pingTimeout: number; connected: boolean },
    mounted() {
        this.websocketSetup();
    },
    methods: {
        websocketSetup() {
            // Check for dev mode
            const devMode = process.env.NODE_ENV === "development";

            this.connected = false;
            this.navPage("Waiting");

            let url: string;
            if (devMode) {
                url = "ws://127.0.0.1:8081/ws/ui";
            } else {
                url = "ws://" + window.location.host + "/ws/ui";
            }

            console.log("Opening websocket on:", url);
            this.websocket = new WebSocket(url);

            // Ping to check if server is responsive
            this.websocket.onopen = () => {
                console.log("Websocket connected");
                this.connected = true;
                setInterval(() => {
                    this.websocket?.send(JSON.stringify({ type: "event", event: "ping" }));
                    this.pingTimeout = setTimeout(() => {
                        console.log("No response from connection! Reopening connection");
                        this.websocketSetup();
                    }, 3000);
                }, 15000);
            };

            // Reconnect when connection ends
            this.websocket.onclose = () => {
                if (this.websocket) {
                    this.websocket.close();
                }
                console.log("Connection lost, reconnecting");
                this.websocketSetup();
            };

            this.websocket.onmessage = (ev) => {
                const res = JSON.parse(ev.data);
                if (res.type == "response" && res.to == "ping") {
                    clearTimeout(this.pingTimeout);
                    return;
                }
                if (res.type == "event") {
                    console.log("Event received:", res.event, "data:", res.data);
                    let redirectTarget = "Waiting";
                    switch (res.event) {
                        case "gettingChipInfo":
                            this.navPage("Loading", { message: "Lade Daten..." });
                            break;
                        case "bookingDevice":
                            this.navPage("Loading", { message: "Gerät wird ausgeliehen..." });
                            break;
                        case "userLogout":
                            this.navPage("Success", {
                                message: "Erfolgreich abgemeldet",
                                redirectTimeout: 2500,
                                redirectTarget: "Waiting",
                            });
                            break;
                        case "userInfo":
                            (this as any).lastUser = {
                                username: res.data.user.vorname + " " + res.data.user.nachname,
                                history: res.data.user.history,
                            };
                            this.navPage("User", (this as any).lastUser);
                            break;
                        case "error":
                            if (res.data.redirectTarget) redirectTarget = res.data.redirectTarget;

                            if (redirectTarget == "User") {
                                this.navPage("Error", { message: res.data.message });

                                setTimeout(() => {
                                    this.navPage("User", (this as any).lastUser);
                                }, 2500);
                            } else {
                                this.navPage("Error", {
                                    message: res.data.message,
                                    redirectTimeout: 5000,
                                    redirectTarget: redirectTarget,
                                });
                            }

                            break;
                        case "bookingCompleted":
                            this.navPage("Success", {
                                message: "Gerät erfolgreich ausgeliehen.",
                            });
                            console.log((this as any).lastUser);
                            if ((this as any).lastUser.isTeacher) {
                                setTimeout(() => {
                                    this.navPage("User", (this as any).lastUser);
                                }, 2500);
                            }
                            break;
                        case "deviceReturned":
                            this.navPage("Success", {
                                message: "Gerät erfolgreich zurückgegeben.",
                                redirectTimeout: 2500,
                                redirectTarget: "Waiting",
                            });
                            break;
                    }
                }

                //console.log(JSON.parse(ev.data))
            };
        },
        navPage(pageName: string, data: any = {}) {
            this.$router.replace({ name: pageName, params: data }).catch((err) => {
                // Silently ignore this error when its an router error. We don't care about redundant navigation
                if (!err._isRouter) throw err;
            });
        },
    },
}).$mount("#app");
