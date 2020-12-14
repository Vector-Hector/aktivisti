<template>
    <h1>Events</h1>

    <ul>
        <li v-for="event in events" :key="event.id">
            {{ event.name }}
        </li>
    </ul>

    <router-link to='/events/new' class="newEventButton">
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
                events: {}
            }
        },
        mounted() {
           this.events = this.fetchEvents()
        },
        methods: {
            fetchEvents(): Event[] {
                return [{
                    id: 0,
                    name: 'HautürWK Köpenick',
                    campaign: 'Landtagswahl',
                    startTime: '11.05.2021',
                    isPublic: true
                }, {
                    id: 1,
                    name: 'HautürWK Kreuzberg',
                    campaign: 'Landtagswahl',
                    startTime: '11.07.2021',
                    isPublic: true
                }]
            }
        }
    })
</script>


<style scoped>
    .newEventButton {
        text-decoration: none;
    }
</style>