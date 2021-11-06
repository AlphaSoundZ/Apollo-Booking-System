<template>
    <div id="app">
        <div class="branding">
            <img src="@/assets/img/school-logo.png" alt="" />
        </div>
        <router-view />
    </div>
</template>

<style lang="scss">
#app {
    font-family: Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

* {
    margin: 0;
    padding: 0;
    font-family: Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}
</style>

<style lang="scss" scoped>
.branding {
    background-image: url("~@/assets/img/dotted-cricles.svg");
    background-repeat: no-repeat;
    position: absolute;
    width: 867px;
    height: 867px;
    top: 0;
    left: 0;

    img {
        padding: 22px;
        max-width: 195px;
        max-height: 195px;
    }
}
</style>
