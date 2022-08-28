<template>
    <div class="user">
        <div class="username">
            <span class="mi icon" :style="{ color: stringToColor(username) }">account_circle</span>
            {{ username }}
        </div>

        <div class="messages">
            <div>
                <big-message
                    message="Zum Ausleihen"
                    header="Halte nun ein Gerät an das Lesegerät"
                    size="67"
                    :class="{ faded: !canBook }"
                >
                    <combined-icon border-radius="8px" added-padding=".05em">
                        <span class="mi">nfc</span>
                        <template v-slot:added>
                            <span class="mi">devices</span>
                        </template>
                    </combined-icon>
                </big-message>
                <big-message
                    message="Zum Ausloggen"
                    header="Halte deinen Chip erneut an das Lesegerät"
                    size="67"
                >
                    <combined-icon>
                        <span class="mi">nfc</span>
                        <template v-slot:added>
                            <span class="mi">radio_button_checked</span>
                        </template>
                    </combined-icon>
                </big-message>
            </div>
        </div>

        <div class="infos" v-if="user.history && user.history.length > 0" ref="infos">
            <h2>Zuletzt Ausgeliehen</h2>
            <div class="recently-booked">
                <div class="booking" v-for="booking in user.history" :key="booking.device_id">
                    <combined-icon
                        v-if="!booking.end"
                        :left="true"
                        class="device"
                        background="#f3f4f9"
                    >
                        <device-icon :device-type="'' + booking.device_type" />
                        <template v-slot:added>
                            <span class="mi">schedule</span>
                        </template>
                    </combined-icon>
                    <device-icon v-else :device-type="booking.device_type" class="device" />
                    <div>
                        <h4>{{ booking.device_type }}</h4>
                        <p v-if="!booking.end">
                            Aktuell Ausgeliehen <br />
                            Seit dem {{ dayjs(booking.begin).format("D.M.YYYY HH:mm") }} Uhr
                        </p>
                        <p v-else>
                            Vom {{ dayjs(booking.begin).format("D.M.YYYY HH:mm") }} Uhr bis zum
                            <br />
                            {{ dayjs(booking.end).format("D.M.YYYY HH:mm") }} Uhr ({{
                                duration(dayjs(booking.end).diff(dayjs(booking.begin))).humanize()
                            }})
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import BigMessage from "@/components/BigMessage.vue";
import CombinedIcon from "@/components/CombinedIcon.vue";
import DeviceIcon from "@/components/DeviceIcon.vue";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/de";

dayjs.locale("de");
dayjs.extend(duration);
dayjs.extend(relativeTime);

export default Vue.extend({
    components: { BigMessage, CombinedIcon, DeviceIcon },
    props: {
        user: {
            default: () => {
                return {
                    firstname: "",
                    lastname: "",
                    history: [] as Array<{
                        device_id: number;
                        device_type: string;
                        begin: string;
                        end: string;
                    }>,
                };
            },
        },
    },
    computed: {
        username() {
            return this.user.firstname + " " + this.user.lastname;
        },
        canBook(): boolean {
            return true;
        },
    },
    methods: {
        dayjs,
        duration: dayjs.duration,
        stringToColor(str: string) {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                hash = str.charCodeAt(i) + ((hash << 5) - hash);
            }
            var colour = "#";
            for (var i = 0; i < 3; i++) {
                var value = (hash >> (i * 8)) & 0xff;
                colour += ("00" + value.toString(16)).substr(-2);
            }
            return colour;
        },
    },
});
</script>

<style lang="scss" scoped>
.user {
    height: 100vh;
    display: flex;
}

.username {
    position: absolute;
    top: 22px;
    left: 360px;
    font-size: 36px;
    display: flex;
    align-items: center;

    .icon {
        margin-right: 15px;
        font-size: 58px;
    }
}

.messages {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;

    .big-message {
        &.faded {
            opacity: 0.1;
        }

        &:first-of-type {
            margin-bottom: 81px;
        }
    }
}

.infos {
    position: relative;
    width: 25vw;
    padding-top: 30px;
    padding-right: 36px;
    max-height: 100vh;
    overflow: hidden;

    h2 {
        font-weight: 300;
        font-size: 36px;
        margin-bottom: 24px;
    }

    .recently-booked {
        .booking {
            background-color: #f3f4f9;
            padding: 21px 0;
            padding-left: 10px;
            display: flex;
            align-items: center;
            border-radius: 23px;
            margin-bottom: 20px;

            .device {
                font-size: 50px;
                margin-right: 27px;
            }

            h4 {
                font-size: 20px;
                font-weight: 400;
                margin-bottom: 0;
            }

            p {
                font-weight: 300;
                font-size: 16px;
            }
        }
    }

    &::after {
        content: "";
        display: block;
        position: absolute;
        height: 120px;
        bottom: 0;
        left: 0;
        width: calc(100% - 36px);
        background: linear-gradient(0deg, rgba(255, 255, 255, 1) 10%, rgba(255, 255, 255, 0) 100%);
    }
}
</style>
