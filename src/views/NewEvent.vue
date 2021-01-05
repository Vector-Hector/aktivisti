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

        <div class="p-field p-grid">
            <label for="eventMeetingPoint" class="p-col-12 p-mb-2 p-md-2 p-mb-md-0">Treffpunkt</label>
            <div class="p-col-12 p-md-10">
                <InputText id="eventMeetingPoint" type="text" v-model="event.meetingpoint" />
            </div>
        </div>

        <div class="p-field p-grid">
            <label for="eventParticipantsMax" class="p-col-12 p-mb-2 p-md-2 p-mb-md-0"># Personen</label>
            <div class="p-col-12 p-md-10">
                <InputNumber showButtons id="eventParticipantsMax" v-model="event.maxParticipants" mode="decimal" :min="0" />
            </div>
        </div>

        <div class="p-field p-grid">
            <label for="eventInfo" class="p-col-12 p-mb-2 p-md-2 p-mb-md-0">Weitere Informationen</label>
            <div class="p-col-12 p-md-10">
                <InputText id="eventInfo" type="text" v-model="event.info" />
            </div>
        </div>

        <div class="p-field p-grid">
            <label for="eventMetrics" class="p-col-12 p-mb-2 p-md-2 p-mb-md-0">Felder (geklopfte Türen etc.) auswählen</label>
            <div class="p-col-12 p-md-10">
                <MultiSelect v-model="event.selectedMetrics" :options="metrics" optionLabel="name" placeholder="Metriken auswählen" display="chip"/>
            </div>
        </div>

        <div v-if="event.selectedMetrics.length > 0">
            <div v-for="metric in event.selectedMetrics" :key="metric.name">
                <div class="p-field p-grid">
                    <label for="eventGoals" class="p-col-12 p-mb-2 p-md-2 p-mb-md-0">Zielvorgabe für {{metric.name}} hinzufügen</label>
                    <div class="p-col-12 p-md-10">
                        <InputNumber v-model="event.targets[metric.name]" showButtons :min="0" />
                    </div>
                </div>
            </div>
        </div>

        <div class="p-field p-grid">
            <label for="eventTasks" class="p-col-12 p-mb-2 p-md-2 p-mb-md-0">Aufgabenbeschreibung</label>
            <div class="p-col-12 p-md-10">
                <InputText id="eventTasks" type="text" v-model="event.tasks" />
            </div>
        </div>


        <div class="p-field p-grid">
            <label for="eventInfoLink" class="p-col-12 p-mb-2 p-md-2 p-mb-md-0">Link zu Info-Material</label>
            <div class="p-col-12 p-md-10">
                <InputText id="eventInfoLink" type="text" v-model="event.infoLink" />
            </div>
        </div>

        <div class="p-field p-grid">
            <label for="eventContact" class="p-col-12 p-mb-2 p-md-2 p-mb-md-0">Kontakt (Telefon, E-Mail)</label>
            <div class="p-col-12 p-md-10">
                <InputText id="eventContact" type="text" v-model="event.contact" />
            </div>
        </div>

    </div>
    <div class="p-field-checkbox">
        <Checkbox id="isNotPublic" name="isNotPublic" value="public" v-model="event.isNotPublic" :binary="true" />
        <label for="isNotPublic">Nicht-öffentlich</label>
    </div>

    <Button v-on:click="saveEvent" label="Speichern" />
    <Button v-on:click="$router.push('/events')" label="Abbrechen" />

</template>

<script lang="ts">
    import { defineComponent } from 'vue'

    import InputText from 'primevue/inputtext'
    import Dropdown from 'primevue/dropdown'
    import Calendar from 'primevue/calendar'
    import Checkbox from 'primevue/checkbox'
    import Button from 'primevue/button'
    import InputNumber from 'primevue/inputnumber'
    import MultiSelect from 'primevue/multiselect'
    
    export default defineComponent({
        name: 'NewEvent',
        components: {
            InputText,
            Dropdown,
            Calendar,
            Checkbox,
            Button,
            InputNumber,
            MultiSelect
        },
        data() {
            return {
                event: {
                    selectedMetrics: [],
                    targets: {}
                },
                campaigns: {},
                metrics: [
                    {name: 'Geklopfte Türen', value: 'Geklopfte Türen'},
                    {name: 'Geöffnete Türen', value: 'Geöffnete Türen'},
                    {name: 'Gute Gespräche', value: 'Gute Gespräche'},
                    {name: 'Zustimmung', value: 'Zustimmung'},
                    {name: 'Unterschriften', value: 'Unterschriften'}
                ]
            }
        },
        created () {
            this.getCampaigns()
        },
        methods: {
            saveEvent() {
                fetch(`${process.env.VUE_APP_BASE_URL}/api/events`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(this.event),
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });

                this.$router.push("/events")
            },
            getCampaigns: function() {
                fetch(`${process.env.VUE_APP_BASE_URL}/api/campaigns`)
                    .then((res) => res.json())
                    .then((json) => {
                        this.campaigns = json.campaigns
                    })
                    .catch(/* handle errors*/)
            },
        }
    });

</script>

<style lang="scss" scoped>
    label {
        text-align: left;
    }
</style>