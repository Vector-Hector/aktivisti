<script setup lang="ts">
import { computed } from 'vue'
import { EventAreaDto } from 'src/api/model/EventAreaDto'
import { EventParticipationDto } from 'src/api/model/EventParticipationDto'
import { AreaDetailsDto } from 'src/api/model/AreaDetailsDto'
import { QBadge, QIcon, QItem, QItemLabel, QItemSection } from 'quasar'
import {
  ionCheckmarkCircleOutline,
  ionChevronForward,
  ionEllipse,
  ionPersonCircleOutline
} from '@quasar/extras/ionicons-v5'
import { EventTypes } from 'src/api/model/EventTypes'
import { UNDEFINED_POSTER_AREA } from 'pages/event-map/detail/area/posters/detail/EventDetailPosterDetail.vue'

interface Props {
  area: EventAreaDto
  participations: EventParticipationDto[]
  personalParticipation?: EventParticipationDto | null
  showParticipationCount?: boolean
  eventType?: EventTypes
}
const props = withDefaults(defineProps<Props>(), {
  personalParticipation: null,
  showParticipationCount: false,
  eventType: EventTypes.DOOR_TO_DOOR
})

const targetRoute = computed(() => {
  switch (props.eventType) {
    case EventTypes.POSTERS:
      return {
        name: 'event-detail-poster',
        params: {
          areaId: props.area.id ? props.area.id : UNDEFINED_POSTER_AREA
        }
      }
    case EventTypes.DOOR_TO_DOOR:
    default:
      return {
        name: 'event-detail-area',
        params: { areaId: props.area.id! }
      }
  }
})
const participationsOfArea = computed(() => {
  return props.participations.filter(({ assigned_event_areas }) =>
    assigned_event_areas.includes(props.area.id!)
  )
})

function countAddresses(areaDetails: AreaDetailsDto) {
  return areaDetails.streets.reduce((acc, street) => {
    return acc + street.addresses.length
  }, 0)
}
</script>
<template>
  <QItem
    :clickable="true"
    :class="{ 'greyed-out': area.is_completed }"
    :to="targetRoute"
  >
    <QItemSection>
      <QItemLabel>
        {{ area.name }}
      </QItemLabel>

      <QItemLabel v-if="eventType === EventTypes.DOOR_TO_DOOR">
        {{ countAddresses(area.area_details) }} Adressen
      </QItemLabel>
      <QItemLabel v-else-if="eventType === EventTypes.POSTERS">
        {{ area.poster_count }} Plakate
      </QItemLabel>
    </QItemSection>

    <QItemSection side>
      <div class="item-buttons">
        <QIcon
          v-if="personalParticipation?.assigned_event_areas?.includes(area.id)"
          class="area-indicator-icon"
          :name="ionPersonCircleOutline"
        />
        <QBadge
          v-if="showParticipationCount"
          outline
          color="primary"
          class="participant-badge"
        >
          {{ participationsOfArea.length }}
        </QBadge>
        <QIcon
          v-if="area.is_completed"
          class="area-indicator-icon"
          :name="ionCheckmarkCircleOutline"
        />
        <QIcon
          v-else
          class="area-indicator-icon"
          :style="{
            color: area.color
          }"
          :name="ionEllipse"
        />
        <QIcon class="chevron" :name="ionChevronForward" />
      </div>
    </QItemSection>
  </QItem>
</template>

<style lang="scss" scoped>
.chevron {
  margin-left: 1rem;
  font-size: 2rem;
}

.area-indicator-icon {
  font-size: 1.2rem;
  margin-left: 1rem;
}

.item-buttons {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.greyed-out {
  opacity: 0.3;
}

.popup-text {
  display: flex;
  color: rgba(var(--ion-text-color-rgb, 0, 0, 0), 0.54);
}

.participant-badge {
  margin-left: 1rem;
}
</style>
