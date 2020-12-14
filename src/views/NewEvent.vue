<template>
    <h1>Neues Event hinzufügen</h1>
    <div class="p-fluid">
        <div class="p-field p-grid">
            <label for="eventName" class="p-col-12 p-mb-2 p-md-2 p-mb-md-0">Names des Events</label>
            <div class="p-col-12 p-md-10">
                <InputText id="eventName" type="text" v-model="event.name" />
            </div>
        </div>
        <div class="p-field p-grid">
            <label for="campaign" class="p-col-12 p-mb-2 p-md-2 p-mb-md-0">Kampagnenauswahl</label>
            <div class="p-col-12 p-md-10">
                <Dropdown v-model="event.selectedCampaign" :options="campaigns" optionLabel="name" placeholder="Wähle eine Kampagne aus" />
            </div>
        </div>
        <div class="p-field p-grid">
            <label for="startTime" class="p-col-12 p-mb-2 p-md-2 p-mb-md-0">Zeit</label>
            <div class="p-col-12 p-md-10">
                <Calendar v-model="event.startTime" dateFormat="dd.mm.yy" />
            </div>
        </div>
    </div>
    <div class="p-field-checkbox">
        <Checkbox id="isPublic" name="isPublic" value="public" v-model="event.isPublic" :binary="true" />
        <label for="isPublic">Öffentlich</label>
    </div>

    <Button v-on:click="saveEvent" label="Speichern" />

</template>

<script lang="ts">
    import { defineComponent } from 'vue'

    import InputText from 'primevue/inputtext'
    import Dropdown from 'primevue/dropdown'
    import Calendar from 'primevue/calendar'
    import Checkbox from 'primevue/checkbox'
    import Button from 'primevue/button'

    export default defineComponent({
        name: 'NewEvent',
        components: {
            InputText,
            Dropdown,
            Calendar,
            Checkbox,
            Button
        },
        data() {
            return {
                event: {} as Event[],
                campaigns: [
                    {name: 'Mietendeckel', id: 0},
                    {name: 'Landtagswahl Baden-Würtemmberg', id: 1}
                ],
            }
        },
        methods: {
            saveEvent() {
                console.log(this.event)
                this.$router.push("/events")
            }
        }
    })

</script>
