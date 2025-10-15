<!--FIXME(peter) 2023/12/12 The composition API doesn't support `beforeRouteEnter` so far so this a workaround
see https://github.com/vuejs/rfcs/discussions/302-->
<script lang="ts">
interface IInstance extends ComponentPublicInstance {
  eventArea: EventAreaDto
}
export default {
  beforeRouteEnter: (to, from, next) => {
    next((vm) => {
      uiStore.updateActiveElements({
        eventArea: (vm as IInstance).eventArea.name
      })
    })
  }
}
</script>
<script setup lang="ts">
import { uiStore } from 'src/store/UiStore'
import {
  QBtn,
  QIcon,
  QItem,
  QItemLabel,
  QItemSection,
  QList,
  QScrollArea,
  useQuasar
} from 'quasar'
import {
  ionCheckmarkCircle,
  ionCheckmarkCircleOutline,
  ionChevronForward,
  ionPlayCircle
} from '@quasar/extras/ionicons-v5'
import { StreetDetails } from 'src/api/model/AreaDetailsDto'
import { difference } from 'lodash-es'
import { useEventStore } from 'src/stores/event'
import AssignAreaParticipants from 'pages/event-map/detail/area/AssignAreaParticipants.vue'
import { useEventDetailStore } from 'pages/event-map/detail/EventDetailStoreMixin'
import { apiClient } from 'src/api/ApiClient'
import { EventAreaDto } from 'src/api/model/EventAreaDto'
import { ComponentPublicInstance } from 'vue'
import { useI18n } from 'vue-i18n'

const $q = useQuasar()
const { t } = useI18n()

const eventStore = useEventStore()
const { eventArea, eventAreaPermissions, completedTargetIds } =
  useEventDetailStore()

/**
 * Check if the street has been started by checking if any of the addresses
 * have been completed.
 *
 * @param street The street to check
 */
function streetStarted(street: StreetDetails) {
  return street.addresses.some(({ osm_id }) =>
    completedTargetIds.value.includes(osm_id.toString())
  )
}
function streetCompleted(street: StreetDetails) {
  return (
    difference(
      // FIXME(peter) Logicalwise the osm_id and completedTargetIds should have
      //  the same type, it seems that the BE is communicating the wrong type
      //  for one of them.
      street.addresses.map(({ osm_id }) => osm_id.toString()),
      completedTargetIds.value
    ).length === 0
  )
}
function openCompletionModal() {
  const statusLabel = eventArea.value.is_completed
    ? t('events.details.area.completionModal.statusLabel.notCompleted')
    : t('events.details.area.completionModal.statusLabel.completed')
  $q.dialog({
    title: t('events.details.area.completionModal.title'),
    message: t('events.details.area.completionModal.description', {
      eventArea: `<b>${eventArea.value.name}</b>`,
      status: `<b>${statusLabel}</b>`
    }),
    html: true,
    cancel: true,
    persistent: true
  })
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    .onOk(async () => {
      try {
        const response = await apiClient.eventAreas.patch(
          eventArea.value.id!.toString(),
          {
            is_completed: !eventArea.value.is_completed
          }
        )
        eventStore.updateEventArea(response.payload.data)
      } catch (error) {
        void $q.notify({
          position: 'bottom',
          message: t('events.details.area.completionModal.generalError'),
          color: 'negative',
          timeout: 2000
        })
      }
    })
}

defineExpose({ eventArea })
</script>

<template>
  <QScrollArea class="d-flex flex-fill">
    <div class="container q-gutter-y-md">
      <div class="row q-col-gutter-x-md">
        <div class="col">
          <AssignAreaParticipants />
        </div>
        <div
          class="col-grow complete-button"
          v-if="eventAreaPermissions?.self?.PATCH"
        >
          <QBtn
            outline
            dense
            round
            flat
            :class="{
              'button-success': eventArea.is_completed
            }"
            @click="openCompletionModal"
            :icon="ionCheckmarkCircleOutline"
          />
        </div>
      </div>
      <div class="row">
        <QList class="address-list">
          <QItem
            v-for="street in eventArea.area_details?.streets"
            :key="street.name"
            :clickable="true"
            :to="{
              name: 'event-detail-area-street',
              params: { street: street.name }
            }"
          >
            <QItemSection>
              <QItemLabel>
                {{ street.name }}
              </QItemLabel>
              <QItemLabel>
                {{
                  $t('events.details.area.addressCounter', [
                    street.addresses.length
                  ])
                }}</QItemLabel
              >
            </QItemSection>

            <QItemSection side>
              <div class="row">
                <QIcon
                  v-if="streetCompleted(street)"
                  class="col finished-icon item-icon progress-icon"
                  :name="ionCheckmarkCircle"
                />
                <QIcon
                  v-else-if="streetStarted(street)"
                  class="col started-icon item-icon progress-icon"
                  :name="ionPlayCircle"
                />
                <QIcon class="col item-icon" :name="ionChevronForward" />
              </div>
            </QItemSection>
          </QItem>
        </QList>
      </div>
    </div>
  </QScrollArea>
</template>

<style lang="scss" scoped>
label {
  text-align: left;
}

.campaign {
  font-weight: bold;
  display: block;
}

.map {
  min-height: 180px;
  margin-bottom: 1.5em;
}

.button-group {
  margin-top: 1.5em;
}

.event-name {
  font-weight: bold;
  font-size: 1rem;
}

.participant-select-label {
  font-weight: bold;
}

.participant-select {
  max-width: 70%;
}

.full-width {
  width: 100%;
}

.join-buttons {
  margin: 0.5rem 0 0;
  display: flex;
  justify-content: center;
}

.address-list {
  width: 100%;
  flex: 1 1 100%;
}

.button-success {
  color: #4caf50;
}

.complete-button {
  display: flex;
  align-items: center;
}

.progress-icon {
  margin-right: 1rem;
}

.finished-icon {
  color: #4caf50;
}

.started-icon {
  color: #ff9800;
}

.item-icon {
  height: 24px;
}
</style>
