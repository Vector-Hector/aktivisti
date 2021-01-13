<template>
  <h1>Kampagnen</h1>

  <ul class="campaigns">
    <li
      v-for="campaign in campaigns"
      :key="campaign.id"
      class="campaign"
    >

      <Button
        icon="pi pi-times"
        class="p-button-danger p-button-text p-button-padding-unset"
        @click="deleteCampaign(campaign.id)"
      />
      <Button
        icon="pi pi-pencil"
        class="p-button-default p-button-text p-button-padding-unset"
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
      campaigns: []
    }
  },
  created() {
    this.getCampaigns()
  },
  methods: {
    deleteCampaign(id: string) {
      fetch(`${process.env.VUE_APP_BASE_URL}/api/campaigns/${id}`, {
        method: 'DELETE',
      })
        .then(res => res.text())
        .then(() => {
          // TODO check again, could be solved differently
          this.getCampaigns()
        })
    },
    async getCampaigns() {
      const response = await fetch(`${process.env.VUE_APP_BASE_URL}/api/campaigns`)
      this.campaigns = await response.json()
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
