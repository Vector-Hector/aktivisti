<script setup lang="ts">
import { QBtn, QIcon } from 'quasar'
import {
  ionCheckmarkCircleOutline,
  ionWarningOutline
} from '@quasar/extras/ionicons-v7'
import { AreaDetailsDto } from 'src/api/model/AreaDetailsDto'
import { EventAreaDto } from 'src/api/model/EventAreaDto'
import { EventTypes } from 'src/api/model/EventTypes'

interface Props {
  eventArea: EventAreaDto
  eventType: EventTypes
}

interface Emits {
  (e: 'onGoToArea'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

function countAddresses(areaDetails: AreaDetailsDto) {
  return areaDetails.streets.reduce((acc, street) => {
    return acc + street.addresses.length
  }, 0)
}

function handleGoToArea() {
  emit('onGoToArea')
}
</script>
<template>
  <div class="popup-contents">
    <span class="popup-title">{{ eventArea.name }}</span>
    <span v-if="props.eventType === EventTypes.DOOR_TO_DOOR">{{
      $t('events.details.areaPopup.addressCounter', [
        countAddresses(eventArea.area_details)
      ])
    }}</span>
    <span v-if="props.eventType === EventTypes.POSTERS">{{
      $t('events.details.areaPopup.posterCounter', [eventArea.poster_count])
    }}</span>
    <div v-if="!eventArea.has_assignee && !eventArea.is_completed">
      <QIcon :name="ionWarningOutline" />
      <span class="popup-content-label">
        {{ $t('events.details.areaPopup.hasNoAssignee') }}</span
      >
    </div>
    <div v-if="eventArea.is_completed">
      <QIcon :name="ionCheckmarkCircleOutline" />
      <span class="popup-content-label">
        {{ $t('events.details.areaPopup.isCompleted') }}</span
      >
    </div>
    <QBtn
      :label="$t('events.details.areaPopup.goToArea')"
      color="primary"
      @click="handleGoToArea"
    />
  </div>
</template>
<style lang="scss">
.popup-contents {
  display: flex;
  flex-direction: column;
}
.popup-title {
  font-weight: bold;
  display: block;
  font-size: 1rem;
}
.popup-content-label {
  margin-left: 0.4rem;
}
</style>
