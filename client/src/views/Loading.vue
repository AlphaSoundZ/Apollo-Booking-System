<template>
    <div class="loading">
        <BigMessage :header="header" :message="message">
            <img src="@/assets/img/spinner.svg" class="spinner-icon" alt="" />
        </BigMessage>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import BigMessage from "@/components/BigMessage.vue";

export default Vue.extend({
    components: { BigMessage },
    props: {
        header: {
            default: "Bitte warten...",
        },
        message: {
            default: "",
        },
    },
});
</script>

<style lang="scss" scoped>
.loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
}
</style>
