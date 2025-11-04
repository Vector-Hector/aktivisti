<script setup lang="ts">
import hat from 'hat'
import { QCardSection, QBtn } from 'quasar'
import { apiClient } from 'src/api/ApiClient'
import { EventAreaDto } from 'src/api/model/EventAreaDto'
import { EventDto } from 'src/api/model/EventDto'

interface Props {
  event: EventDto
}

interface Emits {
  (e: 'onAdoptionOptionClick', eventAreas: Partial<EventAreaDto>[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

async function handleAllAreasClick() {
  await handleClickOnOption()
}

function handleStartedAreasClick() {
  // TODO(peter@control.alt.coop) Add method to handle filtering of areas
  emit('onAdoptionOptionClick', null)
}

function handleNotStartedAreasClick() {
  // TODO(peter@control.alt.coop) Add method to handle filtering of areas
  emit('onAdoptionOptionClick', null)
}

async function handleClickOnOption(): Promise<void> {
  const eventAreas = (
    await apiClient.eventAreas.list({ event: props.event.id.toString() })
  ).payload.data
  const clonedEventAreas = eventAreas.map((area) => ({
    event: props.event.id,
    name: area.name,
    // We're using hat, to get the same schema for the feature_id like mapbox see:
    // https://github.com/mapbox/mapbox-gl-draw/blob/2b9ce3e58e3695c018a48b6fca78ed1a9d1b67c2/src/feature_types/feature.js#L8
    feature_id: hat(),
    color: area.color,
    geometry: area.geometry
  }))
  emit('onAdoptionOptionClick', clonedEventAreas)
}
</script>
<template>
  <QCardSection class="description-section">
    <div class="description">
      <div>
        {{
          $t(
            'adoptEventAreas.recentEventAreas.recentEventAreasOptions.description'
          )
        }}
      </div>
    </div>
  </QCardSection>
  <QCardSection class="section">
    <QBtn
      :label="
        $t('adoptEventAreas.recentEventAreas.recentEventAreasOptions.all')
      "
      color="primary"
      @click="handleAllAreasClick"
    />
    <QBtn
      :label="
        $t(
          'adoptEventAreas.recentEventAreas.recentEventAreasOptions.startedAreas'
        )
      "
      color="primary"
      @click="handleStartedAreasClick"
    />
    <QBtn
      :label="
        $t(
          'adoptEventAreas.recentEventAreas.recentEventAreasOptions.notStartedAreas'
        )
      "
      color="primary"
      @click="handleNotStartedAreasClick"
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
  gap: 0.5rem;
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
