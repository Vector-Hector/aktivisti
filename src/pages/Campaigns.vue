<template>
  <div class="container">
    <h1>Kampagnen</h1>

    <ul class="campaigns">
      <li
        v-for="campaign in campaigns"
        :key="campaign.id"
        class="campaign"
      >
        {{ campaign.name }}
        <Tag
          :value="campaignTypes.find(x => x.id === campaign.campaign_type)?.name"
          severity="info"
        />

        <Button
          icon="pi pi-times"
          class="p-button-text p-button-link"
          @click="deleteCampaign(campaign.id)"
        />
        <Button
          icon="pi pi-pencil"
          class="p-button-text p-button-link"
          @click="editCampaign(campaign.id)"
        />
      </li>
    </ul>

    <router-link
      to="/campaigns/new"
      class="new-campaign-button"
    >
      <Button label="Kampagne hinzufügen" />
    </router-link>
  </div>
</template>


<script lang="ts">
import { defineComponent } from 'vue'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import { CampaignDto } from 'src/api/model/CampaignDto'
import { CampaignTypeDto } from 'src/api/model/CampaignTypeDto'

export default defineComponent({
  name: 'Campaigns',
  components: {
    Button,
    Tag,
  },
  data() {
    return {
      campaigns: [] as CampaignDto[],
      campaignTypes: [] as CampaignTypeDto[]
    }
  },
  created() {
    void this.getCampaigns()
  },
  methods: {
    deleteCampaign(id: number) {
      void this.$apiClient.campaigns.delete(id.toString())
        .then(() => {
          // TODO check again, could be solved differently
          void this.getCampaigns()
        })
    },
    async getCampaigns() {
      const response = await this.$apiClient.campaigns.list({}, ['campaign_type'])
      this.campaignTypes = response.payload.embedded.campaign_type
      this.campaigns = response.payload.data
    },
    editCampaign(id: number) {
      void this.$router.push(`/campaigns/${id}`)
    }
  }
})
</script>

<style lang="scss" scoped>
    .new-campaign-button {
        text-decoration: none;
        display: flex;
        justify-content: flex-end;
    }

    Button {
        margin-left: 10px;
    }

    ul {
        list-style: none;
    }

    .campaigns {
        text-align: left;
    }

    .p-button-padding-unset {
        padding: unset !important;
    }

    .campaign {
        padding-bottom: 10px;
    }
</style>
