<script setup lang="ts">
import { EventAreaDto } from 'src/api/model/EventAreaDto'
import { EventDto } from 'src/api/model/EventDto'
import { QItem, QItemLabel, QItemSection } from 'quasar'
import { computed } from 'vue'
import { useEventTypes } from 'src/api/model/EventTypes'
import { CampaignDto } from 'src/api/model/CampaignDto'
import { useDateFormat } from 'src/utils/dateFormat'

interface Props {
  eventArea: EventAreaDto
  event: EventDto
  campaigns: CampaignDto[]
}

interface Emits {
  (e: 'onClick'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { dateFormat } = useDateFormat()
const { eventTypeOptions } = useEventTypes()

const eventTypeLabel = computed(() => {
  return eventTypeOptions.find(({ key }) => key === props.event.event_type)
    ?.label
})

const campaigns = computed(() => {
  return props.campaigns.map(({ name }) => name).join(',')
})
</script>
<template>
  <QItem tabindex="-1">
    <QItemSection clickable v-ripple tabindex="0" @click="emit('onClick')">
      <QItemLabel>
        <b>{{ props.eventArea.name }}</b>
      </QItemLabel>
      <QItemLabel>
        {{ props.event.name }}
      </QItemLabel>
      <QItemLabel v-if="eventTypeLabel">
        {{ eventTypeLabel }}
      </QItemLabel>
      <QItemLabel>
        {{ campaigns }}
      </QItemLabel>
      <QItemLabel>
        {{ dateFormat(event.start_date, 'datetime') }}
      </QItemLabel>
    </QItemSection>
  </QItem>
</template>
