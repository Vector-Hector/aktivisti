<template>
    <h1>Finde Veranstaltungen in deiner Nähe</h1>

    <div class="map">
        <l-map
            v-model="zoom"
            :zoom="zoom"
            :center="center"
        >
        <l-tile-layer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        ></l-tile-layer>

        <span v-for="event in events" :key="event.id">
            <l-marker v-if="event.location" :lat-lng="[event.location.lat, event.location.lng]">
                <l-popup>
                    {{event.name}}<br>
                    {{event.campaign}}<br>
                    {{event.startTime}}<br>
                </l-popup>
            </l-marker>
        </span>

        </l-map>
    </div>
</template>

<script lang="ts">
    import "leaflet/dist/leaflet.css"
    import {defineComponent} from 'vue'

    import {
        LMap,
        LTileLayer,
        LMarker,
        LPopup,
    // @ts-ignore
    } from "@vue-leaflet/vue-leaflet"

    export default defineComponent({
        name: 'Home',
        components: {
            LMap,
            LTileLayer,
            LMarker,
            LPopup,
        },
        data() {
            return {
                zoom: 6,
                iconWidth: 25,
                iconHeight: 40,
                center: [51.5, 10],
                events: [] as Event[],
            }
        },
        created() {
            this.getEvents()
        },
        methods: {
            getEvents: function(): void {
                fetch(`${process.env.VUE_APP_BASE_URL}/api/events`)
                    .then((res) => res.json())
                    .then((json) => {
                        this.events = json.events
                    })
                    .catch(/* handle errors*/)
            },
        },
    })

</script>

<style lang="scss" scoped>
    .map {
        height: 75vh;
        width: auto;
    }
</style>