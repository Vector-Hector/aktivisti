<template>
    <h1>Kampagne editieren</h1>
    <div class="p-fluid">

        <div class="p-field p-grid">
            <label for="campaignName" class="p-col-12 p-mb-2 p-md-3 p-mb-md-0">Names der Kampagne</label>
            <div class="p-col-12 p-md-9">
                <InputText id="campaignName" type="text" v-model="campaign.name" />
            </div>
        </div>
        
        <div class="p-field p-grid">
            <label for="startTime" class="p-col-12 p-mb-2 p-md-3 p-mb-md-0">Start</label>
            <div class="p-col-12 p-md-9">
                <Calendar v-model="campaign.start" dateFormat="dd.mm.yy" />
            </div>
        </div>

        <div class="p-field p-grid">
            <label for="startTime" class="p-col-12 p-mb-2 p-md-3 p-mb-md-0">Ende</label>
            <div class="p-col-12 p-md-9">
                <Calendar v-model="campaign.end" dateFormat="dd.mm.yy" />
            </div>
        </div>

        <div class="p-field p-grid">
            <label for="campaign" class="p-col-12 p-mb-2 p-md-3 p-mb-md-0">Typ</label>
            <div class="p-col-12 p-md-9">
                <Dropdown v-model="campaign.type" :options="campaignTypes" optionLabel="name" placeholder="Wähle einen Kampagnen-Typ aus" />
            </div>
        </div>

        <div class="p-field p-grid">
            <label for="campaign" class="p-col-12 p-mb-2 p-md-3 p-mb-md-0">Kreis/Land/Bund (TODO)</label>
            <div class="p-col-12 p-md-9">
                <Dropdown v-model="campaign.organisation" :options="organisationType" optionLabel="name" placeholder="Wähle ein Gebiet aus" />
            </div>
        </div>
    </div>

    <div class="control-buttons">
        <Button v-on:click="$router.push('/campaigns')" class="p-button-text" label="Abbrechen" />
        <Button v-on:click="saveCampaign" label="Speichern" />
    </div>

</template>

<script lang="ts">
    import { defineComponent } from 'vue'

    import InputText from 'primevue/inputtext'
    import Dropdown from 'primevue/dropdown'
    import Calendar from 'primevue/calendar'
    import Button from 'primevue/button'

    export default defineComponent({
        name: 'NewCampaign',
        components: {
            InputText,
            Dropdown,
            Calendar,
            Button,
        },
        data() {
            return {
               campaign: {
                },
                campaignTypes: [
                    {name: 'Wahlkampf', id: 0},
                    {name: 'Organizing', id: 1},
                    {name: 'Petition', id: 2},
                    {name: 'Datenerhebung', id: 3}
                ],
            }
        },
        created() {
            this.getCampaign()
        },
        methods: {
            getCampaign() {
                const id = this.$route.params.id
                fetch(`${process.env.VUE_APP_BASE_URL}/api/campaigns/${id}`)
                    .then((res) => res.json())
                    .then((json) => {
                        this.campaign = {...this.campaign, ...json.campaign}
                    })
                    .catch(/* handle errors*/)
            },
            saveCampaign() {
                const id = this.$route.params.id
                fetch(`${process.env.VUE_APP_BASE_URL}/api/campaigns/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(this.campaign),
                })
                // .then(response => response.json())
                .then(data => {
                    console.log('Success:', data)
                })
                .catch((error) => {
                    console.error('Error:', error)
                })

                this.$router.push('/campaigns')
            }
        }
    });

</script>

<style lang="scss" scoped>
    label {
        text-align: left;
    }

    Button {
        margin: 10px;
    }
</style>