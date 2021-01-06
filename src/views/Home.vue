<template>
    <h1>Finde Veranstaltungen in deiner Nähe</h1>

    <div style="height: 75vh; width: 50vw;">
        <l-map
            v-model="zoom"
            :zoom="zoom"
            :center="center"
        >
        <l-tile-layer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        ></l-tile-layer>

        <l-control-layers />

        <l-marker :lat-lng="[53, 12]">
            <l-tooltip>
                Test Tooltip Text
            </l-tooltip>
        </l-marker>

        <l-marker :lat-lng="[52, 13]">
            <l-popup>
                Test Popup Text
            </l-popup>
        </l-marker>

        </l-map>
    </div>
</template>

<script lang="ts">
    import "leaflet/dist/leaflet.css"
    import {
        LMap,
        LTileLayer,
        LMarker,
        LControlLayers,
        LTooltip,
        LPopup,
    } from "@vue-leaflet/vue-leaflet"

    export default {
        components: {
            LMap,
            LTileLayer,
            LMarker,
            LControlLayers,
            LTooltip,
            LPopup,
        },
        data() {
            return {
                zoom: 6,
                iconWidth: 25,
                iconHeight: 40,
                center: [51.5, 10],
            };
        },
        computed: {
        },
        methods: {
        },
    }

</script>

<style scoped>
</style>