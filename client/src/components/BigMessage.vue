<template>
    <div class="big-message" :style="{ fontSize: size + 'px' }">
        <div class="icon">
            <slot />
        </div>
        <div class="text">
            <h2 class="message" v-if="message">{{ message }}</h2>
            <h1 class="header" v-if="header">{{ header }}</h1>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
    props: {
        message: String,
        header: String,
        size: {
            default: 100,
        },
    },
});
</script>

<style lang="scss" scoped>
.big-message {
    display: flex;
    align-items: center;
}

.icon {
    height: 100px;
    width: 100px;
    margin-right: 130px;
    font-size: 100px;
}

.text {
    .message {
        font-weight: 300;
        font-size: 0.64em;
    }

    .header {
        font-size: 0.72em;
        font-weight: 400;
    }
}
</style>
