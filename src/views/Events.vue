<template>
    <h1>Events</h1>

    <ul>
        <li v-for="event in events" :key="event.id">
            {{ event.name }}
            <Button icon="pi pi-times" class="p-button-danger p-button-icon" v-on:click="deleteEvent(event.id)" />
            <Button icon="pi pi-pencil" class="p-button-danger p-button-icon" v-on:click="editEvent(event.id)" />
        </li>
    </ul>

    <router-link to='/events/new' class="new-event-button">
        <Button label="Event hinzufügen" />
    </router-link>

</template>


<script lang="ts">
    import { defineComponent } from 'vue'
    import Button from 'primevue/button'

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
            Button 
        },
        data() {
            return {
                events: {},
                event: {}
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
                .then(res => {
                    // TODO check again, could be solved differently
                    this.getElements()
                    console.log(res)
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
                // todo go to /events/edit/:id
                // get data
                 fetch(`${process.env.VUE_APP_BASE_URL}/api/events/${id}`)
                    .then((res) => res.json())
                    .then((json) => {
                        this.event = json.event
                    })
                    .catch(/* handle errors*/)
            }
        }
    })
</script>


<style lang="scss" scoped>
    .new-event-button {
        text-decoration: none;
    }
</style>