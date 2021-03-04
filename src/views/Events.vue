<template>
  <div class="container">
    <h2>Events</h2>

    <div class="autocomplete">
      <AutoComplete
        v-if="campaigns.length > 0"
        v-model="campaign"
        :suggestions="filteredCampaigns"
        :dropdown="true"
        placeholder="Alle Kampagnen"
        field="name"
        @clear="getEvents"
        @item-select="filterEvents"
        @complete="searchCampaign($event)"
      >
        <template #item="slotProps">
          <div>
            <div>{{ slotProps.item.name }}</div>
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
        <router-link
          class="event-link"
          href=""
          :to="`/events/${event.id}`"
        >
          {{ event.name }}
        </router-link>
        <span
          v-if="event && event.campaign && event.campaign.name"
          class="tag"
        >
          <Tag
            :value="event.campaign.name"
            severity="info"
          />
        </span>

        <!-- <Button
          icon="pi pi-times"
          class="p-button-danger p-button-text p-button-padding-unset"
          @click="deleteEvent(event.id)"
        />
        <Button
          icon="pi pi-pencil"
          class="p-button-default p-button-text p-button-padding-unset"
          @click="editEvent(event.id)"
        /> -->
      </li>
    </ul>

    <router-link
      to="/events/new"
      class="new-event-button"
    >
      <Button label="Event hinzufügen" />
    </router-link>
  </div>
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
    async deleteEvent(id: number) {
      await this.$apiClient.events.delete(id.toString())
      this.events = this.events.filter(item =>
        item.id !== id
      )
    },
    async getEvents() {
      const response = await this.$apiClient.events.list()
      this.events = response.payload.data
    },
    async getCampaigns() {
      const response = await this.$apiClient.campaign.list()
      this.campaigns = response.payload.data
    },
    searchCampaign(event: any) {
      setTimeout(() => {
        if (!event.query.trim().length) {
          this.filteredCampaigns = [...this.campaigns]
        } else {
          this.filteredCampaigns = this.campaigns.filter((campaign: any) => {
            return campaign.name.toLowerCase().startsWith(event.query.toLowerCase())
          })
        }
      }, 250)
    },
    async filterEvents() {
      const response = await this.$apiClient.events.list({
        campaign: this.campaign?.id ?? undefined
      })
      this.events = response.payload.data
    }
  }
})
</script>

<style lang="scss" scoped>
@import 'src/scss/_globals.scss';

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

.autocomplete {
  padding-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

ul {
  padding-inline-start: 0;
}

</style>
