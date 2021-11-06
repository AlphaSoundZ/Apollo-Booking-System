<template>
    <div class="combined-icon">
        <div
            class="added"
            :class="{ left: left }"
            :style="{
                backgroundColor: background,
                borderRadius: borderRadius,
                padding: addedPadding,
            }"
        >
            <slot name="added" />
        </div>
        <slot />
    </div>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
    props: {
        left: {
            default: false,
        },
        background: {
            default: "#fff",
        },
        borderRadius: {
            default: "1em",
        },
        addedPadding: {
            default: "0.01em",
        },
    },
});
</script>

<style lang="scss" scoped>
.combined-icon {
    display: flex;
    position: relative;
    margin-top: 0.18em;

    .added {
        display: flex;
        position: absolute;
        font-size: 0.6em;
        top: -0.3em;
        right: -0.3em;
        overflow: hidden;
        padding: 0.01em;

        &.left {
            right: auto;
            left: -0.3em;
        }
    }
}
</style>
