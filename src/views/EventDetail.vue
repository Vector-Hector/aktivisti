<template>
  <div
    v-if="event !== null"
    class="event container"
  >
    <h2>{{ event.title }}</h2>
    <div class="p-grid">
      <span class="campaign p-col">{{ event.campaign.title }}</span>
    </div>
    <div class="p-grid">
      <span class="p-col-2">Start:</span><span class="start-date p-col-10">{{
        new Date(event.startDate).toLocaleString()
      }}</span>
    </div>
    <div class="p-grid">
      <span class="p-col-2">Ende:</span><span class="start-date p-col-10">{{
        new Date(event.endDate).toLocaleString()
      }}</span>
    </div>
    <div class="p-grid">
      <span class="participants p-col">
        <i class="pi pi-user" /> {{ event.participants }}/{{ event.maxParticipants }}</span>
    </div>
    <div class="p-grid">
      <p class="description p-col">
        {{ event.description }}
      </p>
    </div>

    <div class="p-grid p-jc-end">
      <router-link
        :to="`/events/${event.id}/live`"
        class="start-event-button"
      >
        <Button class="gray-button">
          Starten
        </Button>
      </router-link>
      <Button>Ich bin dabei</Button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { EventDto } from '@/api/model/EventDto'
import { D2DMetricsDto } from '@/api/model/D2DMetricsDto'
import Button from 'primevue/components/button/Button'
import { ApiClient } from '@/api'

interface EventDetailData {
  event: EventDto | null,
  metrics: D2DMetricsDto[] | null
}

const apiClient = new ApiClient()

export default defineComponent({
  name: 'EventDetail',
  components: {
    Button
  },
  data(): EventDetailData {
    return {
      event: null,
      metrics: [
        {name: 'Geklopfte Türen', value: 'Geklopfte Türen'},
        {name: 'Geöffnete Türen', value: 'Geöffnete Türen'},
        {name: 'Gute Gespräche', value: 'Gute Gespräche'},
        {name: 'Zustimmung', value: 'Zustimmung'},
        {name: 'Unterschriften', value: 'Unterschriften'}
      ]
    }
  },
  created() {
    this.getEvent()
  },
  methods: {
    async getEvent() {
      const id = parseInt(this.$route.params.id as string)
      this.event = (await apiClient.events.get(id)).data
    }
  }
})

</script>

<style lang="scss" scoped>
@import "~@/scss/_globals.scss";

label {
  text-align: left;
}

Button {
  margin: 10px;
  background: $red;
  border: 1px solid $red;
}

.campaign {
  font-weight: bold;
  display: block;
}

.start-event-button {
  text-decoration: none;
}

</style>
