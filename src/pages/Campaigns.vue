<template>
  <div class="container">
    <h1>Kampagnen</h1>

    <ul class="campaigns">
      <li v-for="campaign in campaigns" :key="campaign.id" class="campaign">
        {{ campaign.name }}
        <QBadge color="blue">
          {{ campaignTypes.find((x) => x.id === campaign.campaign_type)?.name }}
        </QBadge>
        <QBtn
          @click="deleteCampaign(campaign.id)"
          :icon="ionClose"
          flat
          round
          color="primary"
        />
        <QBtn
          @click="editCampaign(campaign.id)"
          :icon="ionPencil"
          flat
          round
          color="primary"
        />
      </li>
    </ul>

    <router-link to="/campaigns/new" class="new-campaign-button">
      <QBtn color="primary" label="Kampagne hinzufügen" />
    </router-link>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { CampaignDto } from 'src/api/model/CampaignDto'
import { CampaignTypeDto } from 'src/api/model/CampaignTypeDto'
import { ionClose, ionPencil } from '@quasar/extras/ionicons-v5'
import { QBtn, QBadge } from 'quasar'

export default defineComponent({
  name: 'Campaigns',
  components: {
    QBadge,
    QBtn
  },
  data() {
    return {
      campaigns: [] as CampaignDto[],
      campaignTypes: [] as CampaignTypeDto[],
      ionClose,
      ionPencil
    }
  },
  created() {
    void this.getCampaigns()
  },
  methods: {
    deleteCampaign(id: number) {
      void this.$apiClient.campaigns.delete(id.toString()).then(() => {
        // TODO check again, could be solved differently
        void this.getCampaigns()
      })
    },
    async getCampaigns() {
      const response = await this.$apiClient.campaigns.list({}, [
        'campaign_type'
      ])
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
