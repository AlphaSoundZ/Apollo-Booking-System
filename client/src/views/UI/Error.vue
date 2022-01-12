<template>
    <div class="loading centered-page">
        <BigMessage :header="header" :message="message">
            <span class="mi">error</span>
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
            default: "Fehler!",
        },
        message: {
            default: "",
        },
        redirectTimeout: {
            default: -1,
        },
        redirectTarget: {
            default: "",
        },
    },
    data() {
        return {
            redirectId: -1,
        };
    },
    mounted() {
        if ((this as any).redirectTimeout != -1) {
            (this as any).redirectId = setTimeout(() => {
                (this as any).$router.replace({ name: (this as any).redirectTarget });
            }, (this as any).redirectTimeout);
        }
    },
});
</script>
