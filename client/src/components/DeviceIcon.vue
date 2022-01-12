<template>
    <span class="mi">{{ mapping[deviceType.toLowerCase()] }}</span>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
    props: {
        deviceType: String,
    },
    data() {
        return {
            mapping: {
                laptop: "laptop",
                smartphone: "smartphone",
                ipad: "tablet_mac",
            },
        };
    },
});
</script>
