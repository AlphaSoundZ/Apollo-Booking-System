<template>
    <div class="user">
        <div class="username">
            <span class="mi icon">account_circle</span>
            {{ username }}
        </div>

        <div class="messages">
            <div>
                <big-message
                    message="Zum Ausleihen"
                    header="Halte nun ein Gerät an das Lesegerät"
                    size="67"
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

        <div class="infos" v-if="history.length > 0" ref="infos">
            <h2>Zuletzt Ausgeliehen</h2>
            <div class="recently-booked">
                <div class="booking" v-for="booking in history" :key="booking.ID">
                    <device-icon :device-type="booking.device.type.type" class="device" />
                    <div>
                        <h4>{{ booking.device.type.name }}</h4>
                        <p v-if="booking.returnedAt">
                            Vom {{ dayjs(booking.bookedAt).format("D.M.YYYY HH:mm") }} Uhr bis zum
                            <br />
                            {{ dayjs(booking.returnedAt).format("D.M.YYYY HH:mm") }} Uhr ({{
                                duration(
                                    dayjs(booking.returnedAt).diff(dayjs(booking.bookedAt)),
                                ).humanize()
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
        username: {
            default: "Max Mustermann",
        },
        history: {
            default: () => [
                {
                    ID: 1,
                    device: {
                        type: {
                            name: "Microsoft Surface Laptop",
                            type: "laptop",
                        },
                    },
                    bookedAt: "2021-11-06 18:52:00",
                    returnedAt: "2021-11-06 18:53:00",
                },
            ],
        },
    },
    methods: {
        dayjs,
        duration: dayjs.duration,
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

    .big-message:first-of-type {
        margin-bottom: 81px;
    }
}

.infos {
    position: relative;
    width: 610px;
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
            padding: 21px;
            display: flex;
            align-items: center;
            border-radius: 23px;
            margin-bottom: 20px;

            .device {
                font-size: 85px;
                margin-right: 27px;
            }

            h4 {
                font-size: 24px;
                font-weight: 400;
                margin-bottom: 11px;
            }

            p {
                font-weight: 300;
                font-size: 25px;
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
