<template>
  <h1>Events</h1>

  <div class="autocomplete">
    <AutoComplete
      v-if="campaigns.length > 0"
      v-model="campaign"
      class="autocomplete-width"
      :suggestions="filteredCampaigns"
      :dropdown="true"
      field="title"
      @clear="getEvents"
      @item-select="filterEvents"
      @complete="searchCampaign($event)"
    >
      <template #item="slotProps">
        <div>
          <div>{{ slotProps.item.title }}</div>
        </div>
      </template>
    </AutoComplete>
  </div>

  <ul class="events">
    <li
      v-for="event in events"
      :key="event.id"
      class="event"
    >
      {{ event.title }}

      <span
        v-if="event && event.campaign && event.campaign.title"
        class="tag"
      >
        <Tag
          :value="event.campaign.title"
          severity="info"
        />
      </span>

      <Button
        icon="pi pi-times"
        class="p-button-danger p-button-text p-button-padding-unset"
        @click="deleteEvent(event.id)"
      />
      <Button
        icon="pi pi-pencil"
        class="p-button-default p-button-text p-button-padding-unset"
        @click="editEvent(event.id)"
      />
    </li>
  </ul>

  <router-link
    to="/events/new"
    class="new-event-button"
  >
    <Button label="Event hinzufügen" />
  </router-link>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import AutoComplete from 'primevue/autocomplete'
import { EventDto } from '@/api/model/EventDto.ts'
import { CampaignDto } from '@/api/model/CampaignDto.ts'

export default defineComponent({
  name: 'Events',
  components: {
    Button,
    Tag,
    AutoComplete
  },
  data() {
    return {
      events: [] as EventDto[],
      filteredCampaigns: [] as CampaignDto[],
      campaigns: [] as CampaignDto[],
      campaign: null as CampaignDto | null,
      selectedCampaign: null as CampaignDto | null
    }
  },
  created() {
    this.getEvents()
    this.getCampaigns()
  },
  methods: {
    deleteEvent(id: number) {
      fetch(`${process.env.VUE_APP_BASE_URL}/api/events/${id}`, {
        method: 'DELETE'
      })
        .then(res => res.text())
        .then(() => {
          // TODO check again, could be solved differently
          this.getEvents()
        })
    },
    async getEvents() {
      const response = await fetch(`${process.env.VUE_APP_BASE_URL}/api/events`)
      this.events = await response.json()
    },
    editEvent(id: number): void {
      this.$router.push(`/events/${id}`)
    },
    async getCampaigns() {
      const response = await fetch(`${process.env.VUE_APP_BASE_URL}/api/campaigns`)
      this.campaigns = await response.json()
    },
    searchCampaign(event: any) {
      setTimeout(() => {
        if (!event.query.trim().length) {
          this.filteredCampaigns = [...this.campaigns]
        } else {
          this.filteredCampaigns = this.campaigns.filter((campaign: any) => {
            return campaign.title.toLowerCase().startsWith(event.query.toLowerCase())
          })
        }
      }, 250)
    },
    async filterEvents() {
      // TODO filter by backend!
      const response = await fetch(`${process.env.VUE_APP_BASE_URL}/api/events`)
      const events = await response.json()
      this.events = events
      if (this.campaign?.id) {
        this.events = this.events.filter((event) => {
          if (event.campaign?.id) {
            return event.campaign.id == this.campaign?.id
          }
        })
      }
    }
  }
})
</script>

<style lang="scss" scoped>
.new-event-button {
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

.events {
  text-align: left;
}

.p-button-padding-unset {
  padding: unset !important;
}

.event {
  padding-bottom: 20px;
}

.tag {
  margin-left: 10px;
}

</style>
