<template>
    <h1>Events</h1>

    <router-link to='/events/new'>
        <Button label="Event hinzufügen" />
    </router-link>

</template>


<script lang="ts">
    import { defineComponent } from 'vue'
    import Button from 'primevue/button'

    export default defineComponent({
        name: 'Events',
        components: {
            Button 
        }
    })
</script>


<style scoped>
</style>