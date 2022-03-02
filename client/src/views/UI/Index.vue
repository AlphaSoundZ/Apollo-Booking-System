<template>
    <div id="app" :class="{ 'mouse-hidden': mouseHidden }" ref="application">
        <Transition name="slide" appear>
            <div class="connection-status" v-if="connecting">
                <span class="mi">cloud_queue</span>
                <span class="description"> Connecting </span>
            </div>
            <div class="connection-status connected" v-else-if="connected && showBanner">
                <span class="mi">cloud_done</span>
                <span class="description"> Connected </span>
            </div>
            <div class="connection-status disconnected" v-else-if="disconnected">
                <span class="mi">cloud_off</span>
                <span class="description"> Disconnected </span>
            </div>
        </Transition>

        <div class="branding">
            <img src="@/assets/img/school-logo.png" alt="" />
        </div>
        <router-view class="page" />
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import debounce from "lodash.debounce";
import { ConnectionStatus } from "../../main";

export default Vue.extend({
    data() {
        return {
            mouseHidden: false,
            showBanner: true,
            hideBannerTimeout: -1,
        };
    },
    methods: {
        hideMouse: debounce(function (this: any) {
            (this as any).mouseHidden = true;
        }, 2000),
    },
    mounted() {
        document.onmousemove = () => {
            this.mouseHidden = false;
            this.hideMouse();
        };
        setTimeout(() => {
            this.hideMouse();
            (this.$refs.application as Element).requestFullscreen();
        }, 1);
    },
    computed: {
        connected(): boolean {
            return this.$root.connectionStatus == ConnectionStatus.CONNECTED;
        },
        connecting(): boolean {
            return this.$root.connectionStatus == ConnectionStatus.CONNECTING;
        },
        disconnected(): boolean {
            return this.$root.connectionStatus == ConnectionStatus.DISCONNECTED;
        },
    },
    watch: {
        connected(newVal) {
            if (newVal) {
                this.showBanner = true;
                this.hideBannerTimeout = setTimeout(() => {
                    this.showBanner = false;
                }, 5000);
            } else if (this.hideBannerTimeout != -1) {
                clearTimeout(this.hideBannerTimeout);
            }
        },
    },
});
</script>

<style lang="scss">
#app {
    font-family: Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: white;

    height: 100vh;

    &.mouse-hidden {
        cursor: none;
    }
}

* {
    margin: 0;
    padding: 0;
    font-family: Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

img.spinner-icon {
    height: 1em;
}

.centered-page {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
}
</style>

<style lang="scss" scoped>
.branding {
    background-image: url("~@/assets/img/dotted-cricles.svg");
    background-repeat: no-repeat;
    position: absolute;
    width: 393px;
    height: 419px;
    top: 0;
    left: 0;
    z-index: 0;

    img {
        padding: 22px;
        max-width: 195px;
        max-height: 195px;
    }
}

.page {
    position: relative;
    z-index: 1;
}

.connection-status {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    padding: 1rem;
    z-index: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    background-color: #bdc3c7;
    transition: background-color 0.5s;

    .mi {
        font-size: 3rem;
        margin-right: 1rem;
    }
    .description {
        font-size: 1.5rem;
        font-weight: 600;
    }

    &.connected {
        background-color: #2ecc71;
    }
    &.disconnected {
        background-color: #e74c3c;
    }
}

.slide-enter-active,
.slide-leave-active {
    transition: transform 0.5s;
}

.slide-enter,
.slide-leave-to {
    transform: translateY(-100%);
}
</style>
