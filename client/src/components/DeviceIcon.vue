<template>
    <span class="mi">{{ getIcon(deviceType) }}</span>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
    props: {
        deviceType: String,
    },
    data() {
        return {
            mapping: [
                {
                    identifiers: ["1", "ipad"],
                    icon: "tablet_mac",
                },
                {
                    identifiers: ["2", "user", "usercard", "user_card"],
                    icon: "account_cirlce",
                },
                {
                    identifiers: ["3", "surface", "surface_book"],
                    icon: "laptop",
                },
                {
                    identifiers: ["4", "laptop"],
                    icon: "laptop_mac",
                },
            ] as Array<{ identifiers: Array<string>; icon: string }>,
        };
    },
    methods: {
        getIcon(deviceType: string): string {
            deviceType = deviceType.toLowerCase().replace(" ", "_");
            for (const mappingEntry of this.mapping) {
                if (mappingEntry.identifiers.includes(deviceType)) return mappingEntry.icon;
            }
            return this.mapping[0].icon;
        },
    },
});
</script>
