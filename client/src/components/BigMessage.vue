<template>
    <div class="big-message">
        <i v-if="icon" class="icon" :class="icon"></i>
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
        icon: String,
        message: String,
        header: String,
    },
});
</script>

<style lang="scss" scoped>
.big-message {
    display: flex;
}

.icon {
    height: 100px;
    width: 100px;
    margin-right: 130px;
}

.text {
    .message {
        font-weight: 300;
        font-size: 64px;
    }

    .header {
        font-size: 72px;
        font-weight: 400;
    }
}
</style>
