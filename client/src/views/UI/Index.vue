<template>
    <div id="app" :class="{ 'mouse-hidden': mouseHidden }" ref="application">
        <div class="branding">
            <img src="@/assets/img/school-logo.png" alt="" />
        </div>
        <router-view class="page" />
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import debounce from "lodash.debounce";
export default Vue.extend({
    data() {
        return {
            mouseHidden: false,
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
</style>
