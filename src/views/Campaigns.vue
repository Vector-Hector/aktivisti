<template>
  <div class="container">
    <h1>Kampagnen</h1>

    <ul class="campaigns">
      <li
        v-for="campaign in campaigns"
        :key="campaign.id"
        class="campaign"
      >
        {{ campaign.title }}
        <Tag
          :value="organizationTypes.find(x => x.id === campaign.organization)?.name"
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
import { ApiClient } from '@/api'
import { CampaignDto } from '@/api/model/CampaignDto'
import { OrganizationTypeDto } from '@/api/model/OrganizationTypeDto'

const apiClient = new ApiClient()

export default defineComponent({
  name: 'Campaigns',
  components: {
    Button,
    Tag,
  },
  data() {
    return {
      campaigns: [] as CampaignDto[],
      organizationTypes: [] as OrganizationTypeDto[]
    }
  },
  created() {
    this.getCampaigns()
  },
  methods: {
    deleteCampaign(id: string) {
      apiClient.campaign.delete(id)
        .then(() => {
          // TODO check again, could be solved differently
          this.getCampaigns()
        })
    },
    async getCampaigns() {
      const response = await apiClient.campaign.list()
      this.organizationTypes = response.payload.embedded.organization
      this.campaigns = response.payload.data
    },
    editCampaign(id: string) {
      this.$router.push(`/campaigns/${id}`)
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
