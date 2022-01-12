import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import UI from "@/views/UI/Index.vue";
import Waiting from "@/views/UI/Waiting.vue";
import User from "@/views/UI/User.vue";
import Loading from "@/views/UI/Loading.vue";
import Error from "@/views/UI/Error.vue";
import Success from "@/views/UI/Success.vue";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
    {
        path: "/ui",
        component: UI,
        props: true,
        children: [
            {
                path: "",
                name: "Waiting",
                component: Waiting,
                props: true,
            },
            {
                path: "user",
                name: "User",
                component: User,
                props: true,
            },
            {
                path: "loading",
                name: "Loading",
                component: Loading,
                props: true,
            },
            {
                path: "error",
                name: "Error",
                component: Error,
                props: true,
            },
            {
                path: "success",
                name: "Success",
                component: Success,
                props: true,
            },
        ],
    },
];

const router = new VueRouter({
    routes,
});

export default router;
