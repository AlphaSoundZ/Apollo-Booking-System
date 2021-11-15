<template>
    <div class="loading centered-page">
        <BigMessage :header="header" :message="message">
            <span class="mi">check_circle</span>
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
            default: "Erfolg!",
        },
        message: {
            default: "",
        },
    },
});
</script>
