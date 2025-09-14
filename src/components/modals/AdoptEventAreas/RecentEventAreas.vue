<script setup lang="ts">
import { EventDto } from 'src/api/model/EventDto'
import { QCardSection } from 'quasar'
import { EventAreaDto } from 'src/api/model/EventAreaDto'
import { apiClient } from 'src/api/ApiClient'
import hat from 'hat'
import { useEditEventMixin } from 'pages/edit-event/EditEventMixin'
import SelectEvent from './SelectEvent.vue'

interface Emits {
  (e: 'onEventClick', eventAreas: Partial<EventAreaDto>[]): void
}

const emit = defineEmits<Emits>()

async function handleClickOnEvent(event: EventDto): Promise<void> {
  const eventAreas = (
    await apiClient.eventAreas.list({ event: event.id.toString() })
  ).payload.data
  const clonedEventAreas = eventAreas.map((area) => ({
    event: event.id,
    name: area.name,
    // We're using hat, to get the same schema for the feature_id like mapbox see:
    // https://github.com/mapbox/mapbox-gl-draw/blob/2b9ce3e58e3695c018a48b6fca78ed1a9d1b67c2/src/feature_types/feature.js#L8
    feature_id: hat(),
    color: area.color,
    geometry: area.geometry
  }))
  emit('onEventClick', clonedEventAreas)
}
function excludeCurrentEvent(event: EventDto) {
  const { event: currentEvent } = useEditEventMixin()
  return event.id !== currentEvent.value.id
}
</script>
<template>
  <QCardSection class="description-section">
    <span class="description">
      {{ $t('adoptEventAreas.recentEventAreas.description') }}
    </span>
  </QCardSection>
  <QCardSection class="section">
    <SelectEvent
      @clickOnEvent="handleClickOnEvent"
      :filter="excludeCurrentEvent"
    />
  </QCardSection>
</template>

<style lang="scss" scoped>
.section {
  display: flex;
  flex-direction: column;
  // TODO(peter): Find a better solution
  //  This seams to be kind of a bug of quasar see https://github.com/quasarframework/quasar/issues/5926
  //  The scroll area is not displayed the right way in combination with QDialog
  height: 0;
  flex-grow: 1;
}

.description {
  color: $grey-6;
  font-size: 0.75rem;
  line-height: 1;
  display: block;
}

.description-section {
  padding-bottom: 0;
}
</style>
