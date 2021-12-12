<template>
    <div class="loading centered-page">
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
            type: String,
            default: "Bitte warten...",
        },
        message: {
            type: String,
            default: "",
        },
    },
});
</script>
