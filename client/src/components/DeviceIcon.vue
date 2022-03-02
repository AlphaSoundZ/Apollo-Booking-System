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
                "surface book": "laptop",
            } as { [key: string]: string },
        };
    },
    methods: {
        getIcon(deviceType: string) {
            if (this.mapping[deviceType]) return this.mapping[deviceType];
            else return this.mapping[0];
        },
    },
});
</script>
