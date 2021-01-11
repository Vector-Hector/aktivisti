<template>
    <h1>Events</h1>

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
            Tag
        },
        data() {
            return {
                events: [] as Event[],
                event: {} as Event
            }
        },
        created() {
            this.getElements()
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
            }
        }
    })
</script>
<style lang="scss" scoped>
    .new-event-button {
        text-decoration: none;
        float: right;
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
</style>