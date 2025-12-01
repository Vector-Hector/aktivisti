<script setup lang="ts">
import {
  ionBarChart,
  ionPencil,
  ionPrint,
  ionReceipt,
  ionSettingsSharp,
  ionTrash
} from '@quasar/extras/ionicons-v5'
import { EventDto } from 'src/api/model/EventDto'
import { useDeleteEventDialog } from 'src/utils/dialog'
import { EventTypes } from 'src/api/model/EventTypes'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar, QFab, QFabAction } from 'quasar'
import LabeledBtn from 'components/LabeledBtn.vue'
import { apiClient } from 'src/api/ApiClient'
import { useRouter } from 'vue-router'

interface Props {
  event: EventDto
  showCoordinatorFeatures?: boolean
}
interface Emits {
  (e: 'beforeShow'): void
  (e: 'beforeHide'): void
}
const props = withDefaults(defineProps<Props>(), {
  showCoordinatorFeatures: false
})
const emit = defineEmits<Emits>()

const $q = useQuasar()
const $router = useRouter()
const { t } = useI18n()
const PREFIX_HANG_DOWN_POSTERS = t('events.details.prefixHangDownPostersEvent')

const { openDeleteEventDialog } = useDeleteEventDialog()

function openDeleteModal() {
  openDeleteEventDialog(props.event).catch(console.error)
}

const isHangDownEvent = computed(() => {
  return props.event.name.startsWith(PREFIX_HANG_DOWN_POSTERS)
})

const isPrintableEvent = computed(() => {
  const { event_type } = props.event
  return [
    EventTypes.DOOR_TO_DOOR,
    EventTypes.POSTERS,
    EventTypes.FLYERS
  ].includes(event_type)
})

function openPosterTakeDownModal() {
  $q.dialog({
    title: t('events.details.actions.admin.posterTakeDown.dialog.title'),
    message: t(
      'events.details.actions.admin.posterTakeDown.dialog.description',
      [`<b>"${props.event.name}"</b>`]
    ),
    html: true,
    cancel: true
  })
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    .onOk(async () => {
      const newStartDate = new Date()
      newStartDate.setHours(
        newStartDate.getHours() + Math.round(newStartDate.getMinutes() / 60) + 1
      )
      newStartDate.setMinutes(0, 0, 0)
      const newEndDate = new Date(newStartDate)
      newEndDate.setDate(newEndDate.getDate() + 14)
      try {
        await apiClient.events.update(props.event.id.toString(), {
          ...props.event,
          name: PREFIX_HANG_DOWN_POSTERS + props.event.name,
          start_date: newStartDate.toISOString(),
          end_date: newEndDate.toISOString()
        })
        $router.go(0)
      } catch {
        $q.notify({
          color: 'negative',
          message: t(
            'events.details.actions.admin.posterTakeDown.dialog.notifications.generalError'
          )
        })
      }
    })
}
</script>
<template>
  <LabeledBtn :external-label="$t('events.details.actions.admin.label')">
    <template v-slot:btn>
      <QFab
        class="bg-white"
        :icon="ionSettingsSharp"
        color="primary"
        padding="sm"
        direction="left"
        outline
        round
        @before-show="() => emit('beforeShow')"
        @before-hide="() => emit('beforeHide')"
      >
        <QFabAction
          v-if="props.showCoordinatorFeatures"
          @click="openDeleteModal"
          color="primary"
          :icon="ionTrash"
          class="bg-white admin-fab"
          stacked
          :label="$t('events.details.actions.admin.delete.label')"
          outline
          label-class="bg-grey-2 text-primary"
          external-label
          label-position="bottom"
        />
        <QFabAction
          v-if="props.showCoordinatorFeatures"
          :to="{
            name: 'edit-event-details',
            params: { eventId: props.event.id }
          }"
          color="primary"
          :icon="ionPencil"
          class="bg-white admin-fab"
          stacked
          :label="$t('events.details.actions.admin.edit.label')"
          outline
          label-class="bg-grey-2 text-primary"
          external-label
          label-position="bottom"
        />
        <QFabAction
          v-if="
            [EventTypes.DOOR_TO_DOOR, EventTypes.FLYERS].includes(
              props.event.event_type
            ) && props.showCoordinatorFeatures
          "
          :to="{
            name: 'event-detail-report',
            params: { eventId: props.event.id }
          }"
          color="primary"
          :icon="ionBarChart"
          class="bg-white admin-fab"
          stacked
          :label="$t('events.details.actions.admin.report.label')"
          outline
          label-class="bg-grey-2 text-primary"
          external-label
          label-position="bottom"
        />
        <QFabAction
          v-if="
            props.event.event_type === EventTypes.POSTERS &&
            !isHangDownEvent &&
            props.showCoordinatorFeatures
          "
          @click="openPosterTakeDownModal"
          color="primary"
          :icon="ionReceipt"
          class="bg-white admin-fab"
          stacked
          :label="$t('events.details.actions.admin.posterTakeDown.label')"
          outline
          label-class="bg-grey-2 text-primary"
          external-label
          label-position="bottom"
        />
        <QFabAction
          v-if="isPrintableEvent"
          :to="{
            name: 'print-event',
            params: { eventId: props.event.id }
          }"
          color="primary"
          :icon="ionPrint"
          class="bg-white admin-fab"
          stacked
          :label="$t('events.details.actions.admin.print.label')"
          outline
          label-class="bg-grey-2 text-primary"
          external-label
          label-position="bottom"
        />
      </QFab>
    </template>
  </LabeledBtn>
</template>
<style lang="scss" scoped>
.admin-fab {
  margin-left: 15px !important;
  margin-right: 15px !important;
}
</style>
