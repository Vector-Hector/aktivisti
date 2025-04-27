<template>
  <div class="popup-contents">
    <span class="popup-title">{{ event.properties.name }}</span>
    <span class="popup-type">
      {{ getEventTypeLabel(event.properties.event_type) }}
    </span>
    <span class="popup-date">
      {{ dateFormat(event.properties.start_date, 'datetime') }}
    </span>
    <QBtn label="Mitmachen/Infos" color="primary" :to="`/events/${event.id}`" />
  </div>
</template>
<script setup lang="ts">
import { EventGeoJsonFeature } from 'src/api/model/EventGeoJsonDto'
import { eventTypeOptions, EventTypes } from 'src/api/model/EventTypes'
import { QBtn } from 'quasar'
import { useDateFormat } from 'src/utils/dateFormat'

interface Props {
  event: EventGeoJsonFeature
}

defineProps<Props>()

const { dateFormat } = useDateFormat()

function getEventTypeLabel(eventType: EventTypes): string | undefined {
  return eventTypeOptions.find(({ key }) => key === eventType)?.label
}
</script>

<style lang="scss">
.popup-title {
  font-weight: bold;
  display: block;
  font-size: 1rem;
}

.popup-type {
  display: block;
  font-size: 0.9rem;
}

.popup-campaign {
  display: block;
  font-size: 0.9rem;
}

.popup-date {
  display: block;
  font-size: 0.9rem;
}

.popup-contents {
  display: flex;
  flex-direction: column;
}
</style>
