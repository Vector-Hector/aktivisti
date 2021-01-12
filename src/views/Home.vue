<template>
    <h1>Finde Veranstaltungen in deiner Nähe</h1>

    <AutoComplete v-if="campaigns.length" class="autocomplete" v-model="selectedCampaign" :suggestions="filteredCampaigns" @clear="getEvents" @item-select="filterEvents" @complete="searchCampaign($event)" :dropdown="true" field="name">
        <template #item="slotProps">
            <div class="">
                <div>{{slotProps.item.name}}</div>
            </div>
        </template>
    </AutoComplete>

    <div class="map">
        <LMap
            v-model="zoom"
            :zoom="zoom"
            :center="center"
        >
            <LTileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            ></LTileLayer>

            <span v-for="event in events" :key="event.id">
                <LMarker v-if="event.location" :lat-lng="[event.location.lat, event.location.lng]">
                    <LPopup>
                        {{event.name}}<br>
                        {{event.selectedCampaign.name}}<br>
                        {{event.startTime}}<br>
                    </LPopup>
                </LMarker>
            </span>

        </LMap>
    </div>
</template>

<script lang="ts">
    import 'leaflet/dist/leaflet.css'
    import {defineComponent} from 'vue'
    import AutoComplete from 'primevue/autocomplete'

    import {
        LMap,
        LTileLayer,
        LMarker,
        LPopup,
    // @ts-ignore
    } from '@vue-leaflet/vue-leaflet'

    // TODO check if defined twice
    export interface SelectedCampaign {
        name: string
        id: string
    }
    // TODO check if defined twice
    export interface Event {
        id: number
        name: string
        campaign: string
        startTime: string
        isPublic: boolean
        selectedCampaign: undefined|SelectedCampaign
    }

    export default defineComponent({
        name: 'Home',
        components: {
            AutoComplete,
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
                selectedCampaign: null as null|SelectedCampaign,
                filteredCampaigns: [],
                campaigns: [],
            }
        },
        created() {
            this.getEvents()
            this.getCampaigns()
        },
        methods: {
            getEvents(): void {
                fetch(`${process.env.VUE_APP_BASE_URL}/api/events`)
                    .then((res) => res.json())
                    .then((json) => {
                        this.events = json.events
                    })
                    .catch(/* handle errors*/)
            },
            getCampaigns() {
                fetch(`${process.env.VUE_APP_BASE_URL}/api/campaigns`)
                    .then((res) => res.json())
                    .then((json) => {
                        this.campaigns = json.campaigns
                    })
                    .catch(/* handle errors*/)
            },
            searchCampaign(event: any) {
                setTimeout(() => {
                    if (!event.query.trim().length) {
                        this.filteredCampaigns = [...this.campaigns];
                    }
                    else {
                        this.filteredCampaigns = this.campaigns.filter((campaign: any) => {
                            return campaign.name.toLowerCase().startsWith(event.query.toLowerCase());
                        })
                    }
                }, 250);
            },
            filterEvents() {
                // TODO
                // fetch events once and store them locally
                fetch(`${process.env.VUE_APP_BASE_URL}/api/events`)
                    .then((res) => res.json())
                    .then((json) => {
                        this.events = json.events

                        if (this.selectedCampaign && this.selectedCampaign.name) {
                            this.events = this.events.filter((event: Event) => {
                                if (event.selectedCampaign && event.selectedCampaign.name && this.selectedCampaign) {
                                    return event.selectedCampaign.name == this.selectedCampaign.name
                                }
                            })
                        }

                    })
                    .catch(/* handle errors*/)
            }
        },
    })

</script>

<style lang="scss" scoped>
    .map {
        height: 75vh;
        width: auto;
    }

    .autocomplete {
        float: right;
        padding-bottom: 20px;
    }

</style>