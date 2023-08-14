<script setup lang="ts">
import { EventAreaDto } from 'src/api/model/EventAreaDto'
import { EventDto } from 'src/api/model/EventDto'
import EventAreaListItem from 'components/EventAreaListItem.vue'
import { ref } from 'vue'
import { CampaignDto } from 'src/api/model/CampaignDto'
import { QList } from 'quasar'

interface Props {
  eventAreas: EventAreaDto[]
  events?: EventDto[]
  campaigns?: CampaignDto[]
}

interface Emits {
  (e: 'onEventAreaClick', eventArea: EventAreaDto): void
}

const props = withDefaults(defineProps<Props>(), {
  eventAreas: () => [],
  events: () => [],
  campaigns: () => []
})

const emit = defineEmits<Emits>()

function getEvent(eventId: number) {
  return props.events.find(({ id }) => id === eventId)
}

function getCampaigns(eventId: number) {
  return props.campaigns.filter(({ id }) =>
    getEvent(eventId)?.campaigns.includes(id)
  )
}

function handleEventAreaClick(eventArea: EventAreaDto) {
  emit('onEventAreaClick', eventArea)
}

const eventAreas = ref<EventAreaDto[]>(props.eventAreas)
</script>
<template>
  <QList v-if="eventAreas.length > 0">
    <EventAreaListItem
      v-for="item in eventAreas"
      @onClick="handleEventAreaClick(item)"
      :key="item.id"
      :event-area="item"
      :event="getEvent(item.event)"
      :campaigns="getCampaigns(item.event)"
    />
  </QList>
</template>
