<template>
    <h1>Kampagnen</h1>

    <ul>
        <li v-for="campaign in campaigns" :key="campaign.id">
            {{ campaign.name }}
            <Button icon="pi pi-times" class="p-button-danger p-button-icon" v-on:click="deleteCampaign(campaign.id)" />
            <Button icon="pi pi-pencil" class="p-button-default p-button-icon" v-on:click="editCampaign(campaign.id)" />
        </li>
    </ul>

    <router-link to='/campaigns/new' class="new-event-button">
        <Button label="Kampagne hinzufügen" />
    </router-link>

</template>


<script lang="ts">
    import { defineComponent } from 'vue'
    import Button from 'primevue/button'

    export default defineComponent({
        name: 'Campaigns',
        components: {
            Button 
        },
        data() {
            return {
                campaigns: {},
                campaign: {}
            }
        },
        created() {
            this.getCampaigns()
        },
        methods: {
            deleteCampaign: function(id: number) {
                fetch(`${process.env.VUE_APP_BASE_URL}/api/campaigns/${id}`, {
                    method: 'DELETE',
                })
                .then(res => res.text())
                .then(res => {
                    // TODO check again, could be solved differently
                    this.getCampaigns()
                    console.log(res)
                })
            },
            getCampaigns: function() {
                fetch(`${process.env.VUE_APP_BASE_URL}/api/campaigns`)
                    .then((res) => res.json())
                    .then((json) => {
                        this.campaigns = json.campaigns
                    })
                    .catch(/* handle errors*/)
            },
            editCampaign: function(id: number) {
                this.$router.push(`/campaigns/${id}`)
            }
        }
    })
</script>


<style lang="scss" scoped>
    .new-event-button {
        text-decoration: none;
    }

    Button {
        margin-left: 10px;
    }

    ul {
        list-style: none;
    }
</style>