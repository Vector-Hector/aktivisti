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
        created() {
            // TODO write sth. like
            // this.events = await fetch(`${process.env.VUE_APP_BASE_URL}/api/events`) ...
            fetch(`${process.env.VUE_APP_BASE_URL}/api/events`)
                .then((res) => res.json())
                .then((json) => {
                    this.events = json.events
                })
                .catch(/* handle errors*/)
        },
        methods: { }
    })
</script>


<style scoped>
    .newEventButton {
        text-decoration: none;
    }
</style>