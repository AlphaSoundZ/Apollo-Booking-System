<template>
    <div class="waiting centered-page">
        <div>
            <BigMessage message="Zum Ausleihen" header="Halte deinen Chip an das Lesegerät">
                <CombinedIcon>
                    <span class="mi">nfc</span>
                    <template v-slot:added>
                        <span class="mi">radio_button_checked</span>
                    </template>
                </CombinedIcon>
            </BigMessage>
            <BigMessage message="Zum Zurückgeben" header="Halte das Gerät an das Lesegerät">
                <CombinedIcon border-radius="8px" added-padding=".05em">
                    <span class="mi">nfc</span>
                    <template v-slot:added>
                        <span class="mi">devices</span>
                    </template>
                </CombinedIcon>
            </BigMessage>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import BigMessage from "@/components/BigMessage.vue";
import CombinedIcon from "@/components/CombinedIcon.vue";

export default Vue.extend({
    components: { BigMessage, CombinedIcon },
});
</script>

<style lang="scss" scoped>
.big-message:first-of-type {
    margin-bottom: 157px;
}
</style>
