<script setup lang="ts">
import hat from 'hat'
import { QCardSection, QBtn } from 'quasar'
import { apiClient } from 'src/api/ApiClient'
import { CompletionNoteDto } from 'src/api/model/CompletionNoteDto'
import { EventAreaDto } from 'src/api/model/EventAreaDto'
import { EventDto } from 'src/api/model/EventDto'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

interface Props {
  event: EventDto
}

interface Emits {
  (e: 'onAdoptionOptionClick', eventAreas: Partial<EventAreaDto>[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()

const eventAreas = ref<EventAreaDto[]>([])
const completionNotes = ref<CompletionNoteDto[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

const eventAreaIdsWithCompletionNotes = computed(
  () => new Set(completionNotes.value.map((note) => note.event_area))
)

const startedEventAreas = computed(() =>
  eventAreas.value.filter((area) =>
    eventAreaIdsWithCompletionNotes.value.has(area.id)
  )
)

const notStartedEventAreas = computed(() =>
  eventAreas.value.filter(
    (area) => !eventAreaIdsWithCompletionNotes.value.has(area.id)
  )
)

async function loadEventAreasData(): Promise<void> {
  try {
    isLoading.value = true
    error.value = null

    const responseData = (
      await apiClient.eventAreas.list({ event: props.event.id.toString() }, [
        'completion_notes'
      ])
    ).payload

    eventAreas.value = responseData.data
    completionNotes.value = responseData.embedded.completion_notes
  } catch {
    error.value = t(
      'adoptEventAreas.recentEventAreas.recentEventAreasOptions.errorMessage'
    )
  } finally {
    isLoading.value = false
  }
}

onMounted(loadEventAreasData)

/**
 * Remove all data from event area, that is not required for creating a new event area
 *
 * @param area - Event area to copy the data from
 */
function clearEventArea(area: EventAreaDto): Partial<EventAreaDto> {
  return {
    event: props.event.id,
    name: area.name,
    // We're using hat, to get the same schema for the feature_id like mapbox see:
    // https://github.com/mapbox/mapbox-gl-draw/blob/2b9ce3e58e3695c018a48b6fca78ed1a9d1b67c2/src/feature_types/feature.js#L8
    feature_id: hat(),
    color: area.color,
    geometry: area.geometry
  }
}

function emitAdoptionOption(areas: EventAreaDto[]): void {
  const mappedAreas = areas.map(clearEventArea)
  emit('onAdoptionOptionClick', mappedAreas)
}

function handleAllAreasClick(): void {
  emitAdoptionOption(eventAreas.value)
}

function handleStartedAreasClick(): void {
  emitAdoptionOption(startedEventAreas.value)
}

function handleNotStartedAreasClick(): void {
  emitAdoptionOption(notStartedEventAreas.value)
}
</script>
<template>
  <QCardSection class="description-section">
    <p class="description">
      {{
        $t(
          'adoptEventAreas.recentEventAreas.recentEventAreasOptions.description'
        )
      }}
    </p>
  </QCardSection>

  <QCardSection v-if="error" class="error-section">
    <p class="error-text">{{ error }}</p>
    <QBtn
      :label="
        $t('adoptEventAreas.recentEventAreas.recentEventAreasOptions.retry')
      "
      color="negative"
      outline
      size="sm"
      @click="loadEventAreasData"
    />
  </QCardSection>

  <QCardSection v-else class="section">
    <QBtn
      :label="
        $t('adoptEventAreas.recentEventAreas.recentEventAreasOptions.all')
      "
      :loading="isLoading"
      :disable="isLoading || eventAreas.length === 0"
      color="primary"
      @click="handleAllAreasClick"
    />
    <QBtn
      :label="
        $t(
          'adoptEventAreas.recentEventAreas.recentEventAreasOptions.startedAreas'
        )
      "
      :loading="isLoading"
      :disable="isLoading || startedEventAreas.length === 0"
      color="primary"
      @click="handleStartedAreasClick"
    />
    <QBtn
      :label="
        $t(
          'adoptEventAreas.recentEventAreas.recentEventAreasOptions.notStartedAreas'
        )
      "
      :loading="isLoading"
      :disable="isLoading || notStartedEventAreas.length === 0"
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
  line-height: 1.2;
  margin: 0;
}

.description-section {
  padding-bottom: 0;
}

.error-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  height: 0;
  flex-grow: 1;
}

.error-text {
  color: $negative;
  font-size: 0.875rem;
  text-align: center;
  margin: 0;
}
</style>
