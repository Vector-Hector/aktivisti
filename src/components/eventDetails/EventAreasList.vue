<script setup lang="ts">
import { QList } from 'quasar'
import { EventAreaDto } from 'src/api/model/EventAreaDto'
import { EventTypes } from 'src/api/model/EventTypes'
import { PosterDto } from 'src/api/model/PosterDto'
import { computed } from 'vue'
import EventAreaItem from '../EventAreaItem.vue'
import { useI18n } from 'vue-i18n'
import { EventParticipationDto } from 'src/api/model/EventParticipationDto'
interface Props {
  eventId: number
  eventAreas: EventAreaDto[]
  eventType: EventTypes
  personalParticipation: EventParticipationDto
  posters?: PosterDto[]
  showParticipationCount?: boolean
  // Just required when `showParticipationCount` is set
  participations?: EventParticipationDto[]
}
const props = withDefaults(defineProps<Props>(), {
  posters: () => [],
  showParticipationCount: false,
  participations: () => []
})

const { t } = useI18n()

const eventAreasSorted = computed(() => {
  const collator = new Intl.Collator('de', { caseFirst: 'upper' })
  return [...props.eventAreas].sort((a, b) => {
    if (a.is_completed && !b.is_completed) {
      return 1
    }
    if (!a.is_completed && b.is_completed) {
      return -1
    }
    return collator.compare(a.name, b.name)
  })
})
const postersWithoutArea = computed(() =>
  props.posters.filter(({ area }) => area === null)
)

const noAreaPosters = computed(() => {
  return {
    id: undefined,
    name: t('events.details.noAreaPosters'),
    color: '#FFFFFF',
    event: props.eventId,
    is_completed: false,
    poster_count: postersWithoutArea.value.length
  } as Partial<EventAreaDto>
})
</script>
<template>
  <QList>
    <EventAreaItem
      v-for="area in eventAreasSorted"
      :key="area.id"
      :area="area"
      :participations="props.participations"
      :show-participation-count="props.showParticipationCount"
      :personal-participation="props.personalParticipation"
      :event-type="props.eventType"
    />
    <EventAreaItem
      v-if="
        props.eventType === EventTypes.POSTERS && postersWithoutArea.length > 0
      "
      :area="noAreaPosters"
      :participations="[]"
      :event-type="props.eventType"
    />
  </QList>
</template>
