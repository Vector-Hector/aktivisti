<template>
    <h1>Events</h1>

    <AutoComplete v-if="campaigns.length && events.length" class="autocomplete" v-model="selectedCampaign" :suggestions="filteredCampaigns" @complete="searchCampaign($event)" :dropdown="true" field="name">
        <template #item="slotProps">
            <div class="">
                <div>{{slotProps.item.name}}</div>
            </div>
        </template>
    </AutoComplete>

    <ul class="events">
        <li v-for="event in events" :key="event.id" class="event">
            {{ event.name }}

            <span class="tag" v-if="event && event.selectedCampaign && event.selectedCampaign.name">
                <Tag :value="event.selectedCampaign.name" severity="info"></Tag>
            </span>

            <Button icon="pi pi-times" class="p-button-danger p-button-text p-button-padding-unset" v-on:click="deleteEvent(event.id)" />
            <Button icon="pi pi-pencil" class="p-button-default p-button-text p-button-padding-unset" v-on:click="editEvent(event.id)" />
        </li>
    </ul>

    <router-link to='/events/new' class="new-event-button">
        <Button label="Event hinzufügen" />
    </router-link>

</template>


<script lang="ts">
    import { defineComponent } from 'vue'
    import Button from 'primevue/button'
    import Tag from 'primevue/tag'
    import AutoComplete from 'primevue/autocomplete'


    // TODO adjust type
    export interface Event {
        id: number
        name: string
        campaign: string
        startTime: string
        isPublic: boolean
    }

    export default defineComponent({
        name: 'Events',
        components: {
            Button,
            Tag,
            AutoComplete,
        },
        data() {
            return {
                events: [] as Event[],
                event: {} as Event,
                selectedCampaign: [],
                filteredCampaigns: [],
                campaigns: [],
            }
        },
        created() {
            this.getElements()
            this.getCampaigns()
        },
        methods: {
            deleteEvent: function(id: number) {
                fetch(`${process.env.VUE_APP_BASE_URL}/api/events/${id}`, {
                    method: 'DELETE',
                })
                .then(res => res.text())
                .then(() => {
                    // TODO check again, could be solved differently
                    this.getElements()
                })
            },
            getElements: function() {
                fetch(`${process.env.VUE_APP_BASE_URL}/api/events`)
                    .then((res) => res.json())
                    .then((json) => {
                        this.events = json.events
                    })
                    .catch(/* handle errors*/)
            },
            editEvent: function(id: number) {
                this.$router.push(`/events/${id}`)
            },
            getCampaigns: function() {
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
                        });
                    }
                }, 250);
            }
        }
    })
</script>
<style lang="scss" scoped>
    .new-event-button {
        text-decoration: none;
        float: right;
        clear: both;
    }

    Button {
        margin-left: 10px;
    }

    ul {
        list-style: none;
    }

    .events {
        text-align: left;
    }

    .p-button-padding-unset {
        padding: unset !important;
    }

    .event {
        padding-bottom: 20px;
    }

    .tag {
        margin-left: 10px;
    }

    .autocomplete {
        float: right;
        padding-bottom: 20px;
    }
</style>