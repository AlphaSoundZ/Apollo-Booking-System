import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Waiting from "@/views/Waiting.vue";
import Loading from "@/views/Loading.vue";
import Error from "@/views/Error.vue";
import User from "@/views/User.vue";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
    {
        path: "/",
        name: "Waiting",
        component: Waiting,
    },
    {
        path: "/user",
        name: "User",
        component: User,
    },
    {
        path: "/loading",
        name: "Loading",
        component: Loading,
    },
    {
        path: "/error",
        name: "Error",
        component: Error,
    }
];

const router = new VueRouter({
    routes,
});

export default router;
