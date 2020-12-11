<template>
    <h1>Events</h1>

    <router-link to='/events/new'>
        <Button label="Event hinzufügen" />
    </router-link>

</template>

<script>
import Button from 'primevue/button'

export default {
    components: {
        Button,
    },
    data() {
        return {
        }
    }
}
</script>

<style scoped>
    router-link {
        text-decoration: none;
    }
</style>