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
        pingTimeout: 0
    } as { websocket: null | WebSocket, pingTimeout: number },
    mounted() {
        this.websocketSetup();
    },
    methods: {
        websocketSetup() {
            this.navPage("Loading", {message: "Verbinde mit Server"})

            const devMode = process.env.NODE_ENV === 'development';

            let url: string;
            if (devMode) {
                url = "ws://192.168.0.93:8080/ws/ui";
            } else {
                url = "ws://" + window.location.host + "/ws/ui";
            }
            
            console.log("Opening websocket on:", url);
            this.websocket = new WebSocket(url);

            this.websocket.onopen = () => {
                this.navPage("Waiting")
                console.log("Websocket connected");
                setInterval(() => {
                    this.websocket?.send(JSON.stringify({type: "event", event: "ping"}));
                    this.pingTimeout = setTimeout(() => {
                        console.log("Websocket connection lost! Trying to reconnect");
                        this.websocketSetup();
                    }, 3000);
                }, 15000);
            }

            this.websocket.onclose = (ev) => {
                console.log("Connection lost:", ev.reason, "Reconnecting");
                this.websocketSetup();
            }

            this.websocket.onmessage = (ev) => {
                const res = JSON.parse(ev.data)
                if (res.type == "response" && res.to == "ping") {
                    clearTimeout(this.pingTimeout);
                    return;
                }

                if (res.type == "event") {
                    console.log("Event received:", res.event, "data:", res.data);
                    switch (res.event) {
                        case "gettingChipInfo":
                            this.navPage("Loading", {message: "Lade Daten"})
                            break;
                        case "userLogout":
                            this.navPage("Waiting");
                            break;
                        case "userInfo":
                            this.navPage("userInfo", {username: res.data.user.vorname + res.data.user.nachname, history: res.data.user.history})
                            break;
                        case "error":
                            this.navPage("Error", {message: res.data.message})
                            break;
                    }
                }

                //console.log(JSON.parse(ev.data))
            }
        },
        navPage(pageName: string, data: any = {}) {
            this.$router.push({name: pageName, params: data});
        }
    }
}).$mount("#app");
