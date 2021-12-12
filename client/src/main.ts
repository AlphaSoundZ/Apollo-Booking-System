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
        websocket: null
    } as { websocket: null | WebSocket },
    mounted() {
        const devMode = process.env.NODE_ENV === 'development';

        let url;
        if (devMode) {
            url = "ws://192.168.0.93:8080/ws/ui";
        } else {
            url = "ws://" + window.location.host + "/ws/ui";
        }
        
        console.log("Opening websocket on:", url);
        this.websocket = new WebSocket(url);

        this.websocket.onopen = () => {
            console.log("Websocket connected");
            this.websocket?.send(JSON.stringify({type: "event", event: "ping"}))
        }

        this.websocket.onmessage = (ev) => {
            console.log(JSON.parse(ev.data))
        }

    }
}).$mount("#app");
