<script setup lang="ts">
import { computed, inject, onMounted, ref, watch } from 'vue'

import { EventTypes, useEventTypes } from 'src/api/model/EventTypes'
import { useEditEventMixin } from 'src/pages/edit-event/EditEventMixin'
import { VisibilityOptions, useVisibilityLabels } from 'src/api/model/EventDto'
import { EventMetricRecordDto } from 'src/api/model/EventMetricRecordDto'
import { EventMetricDto } from 'src/api/model/EventMetricDto'
import {
  date,
  QCheckbox,
  QForm,
  QInput,
  QScrollArea,
  QSelect,
  useQuasar
} from 'quasar'
import { SettleDebouncer } from 'src/utils/debounce'
import { cloneDeep, isEqual } from 'lodash-es'
import { dateMaskMatches } from 'src/utils/date'
import { StepControls } from 'pages/EditEvent.vue'
import { useEditEventAutoSaveMixin } from 'pages/edit-event/EditEventAutoSaveMixin'
import { apiClient } from 'src/api/ApiClient'
import DateTimeInput from 'components/DateTimeInput.vue'
import SidebarBottomStepNavigation from 'components/SidebarBottomStepNavigation.vue'
import { useValidationRules } from 'src/utils/validationRules'
import { useI18n } from 'vue-i18n'

const $q = useQuasar()
const { t } = useI18n()
const { getLabel } = useVisibilityLabels()
const { metricRecords, campaigns, event } = useEditEventMixin()
const { errors, saveDebouncer } = useEditEventAutoSaveMixin()
const { eventTypeOptions } = useEventTypes()
const { validationRules } = useValidationRules()
const stepControls = inject('stepControls') as StepControls

// Fixme(peter) Check what of the metrics functionality is still needed here
//  in the past it was possible for the user to customize the metrics set
//  this functionality was removed on the UI, but it seems like that this file
//  still contains remnants of this functionality.
const metricsSaveDebouncer = new SettleDebouncer()
const metrics = ref<EventMetricDto[]>([])
const lastSavedMetricRecords = ref<EventMetricRecordDto[] | null>(null)
const startDate = ref<string>('')
const endDate = ref<string>('')
const mask = ref<string>(t('config.datetimeFormats.dateTimePickerMask'))

const currentYearMonth = computed(() => date.formatDate(new Date(), 'YYYY/MM'))
const eventTypes = computed(() => eventTypeOptions)

onMounted(async () => {
  await getMetrics()
  lastSavedMetricRecords.value = cloneDeep(metricRecords.value)
})

watch(
  () => event.value.start_date,
  (newValue) => {
    if (!newValue) {
      const initialDate = new Date()
      initialDate.setHours(
        initialDate.getHours() + Math.round(initialDate.getMinutes() / 60)
      )
      initialDate.setMinutes(0, 0, 0)
      startDate.value = date.formatDate(new Date(initialDate), mask.value)
    } else {
      startDate.value = date.formatDate(new Date(newValue), mask.value)
    }
    if (new Date(event.value.start_date) > new Date(event.value.end_date)) {
      const start = new Date(date.extractDate(startDate.value, mask.value))
      const newEndDate = date.addToDate(start, { hours: 1 })
      endDate.value = date.formatDate(newEndDate, mask.value)
    }
  },
  { immediate: true }
)

watch(
  () => event.value.end_date,
  (newValue) => {
    if (!newValue) {
      const initialDate = event.value.start_date
        ? new Date(event.value.start_date)
        : new Date()
      initialDate.setHours(
        initialDate.getHours() + Math.round(initialDate.getMinutes() / 60) + 1
      )
      initialDate.setMinutes(0, 0, 0)
      endDate.value = date.formatDate(new Date(initialDate), mask.value)
    } else {
      endDate.value = date.formatDate(new Date(newValue), mask.value)
    }
    if (new Date(event.value.start_date) > new Date(event.value.end_date)) {
      const end = new Date(date.extractDate(endDate.value, mask.value))
      const newStartDate = date.subtractFromDate(end, { hours: 1 })
      startDate.value = date.formatDate(newStartDate, mask.value)
    }
  },
  { immediate: true }
)
watch(startDate, (newValue) => {
  if (dateMaskMatches(newValue, mask.value)) {
    const extractedDate = date.extractDate(newValue, mask.value)
    const extractedIsoDate = extractedDate.toISOString()
    if (extractedIsoDate !== event.value.start_date) {
      event.value.start_date = extractedIsoDate
    }
  } else {
    errors.value.start_date = [
      t('events.edit.details.notifications.invalidDateError')
    ]
  }
})
watch(endDate, (newValue) => {
  if (dateMaskMatches(newValue, mask.value)) {
    const extractedDate = date.extractDate(newValue, mask.value)
    const extractedIsoDate = extractedDate.toISOString()
    if (extractedIsoDate !== event.value.end_date) {
      event.value.end_date = extractedIsoDate
    }
  } else {
    errors.value.end_date = [
      t('events.edit.details.notifications.invalidDateError')
    ]
  }
})

watch(
  metricRecords,
  (newValue) => {
    void metricsSaveDebouncer.executeDebounced(async () => {
      if (!isEqual(newValue, lastSavedMetricRecords.value)) {
        await updateMetrics()
      }
    })
  },
  { deep: true }
)

async function updateMetrics() {
  try {
    const metricRecordsRequest = await apiClient.events.batchSetMetricRecords(
      event.value.id.toString(),
      metricRecords.value
    )
    lastSavedMetricRecords.value = cloneDeep(metricRecordsRequest.payload.data)
    metricRecords.value = cloneDeep(metricRecordsRequest.payload.data)
    $q.notify({
      color: 'positive',
      message: t('events.edit.details.notifications.successMessageMetrics')
    })
  } catch {
    $q.notify({
      color: 'negative',
      message: t('events.edit.details.notifications.generalErrorMetrics')
    })
  }
}

async function getMetrics() {
  const metricsRequest = await apiClient.eventMetrics.list({
    available_for_types: event.value.event_type
  })
  metrics.value = metricsRequest.payload.data
}

async function back() {
  await saveDebouncer.waitForSettle()
  stepControls.previous()
}

async function next() {
  await saveDebouncer.waitForSettle()
  stepControls.next()
}
</script>

<template>
  <div class="container">
    <QScrollArea class="d-flex flex-fill">
      <QForm>
        <QSelect
          filled
          v-model="event.event_type"
          :label="$t('events.edit.details.eventType')"
          disable
          :option-disable="() => true"
          :options="eventTypes"
          option-label="label"
          option-value="key"
          emit-value
          map-options
          :error-message="errors.event_type?.[0]"
          :error="!!errors.event_type?.length"
        />
        <QInput
          filled
          v-model="event.name"
          :label="$t('events.edit.details.eventName')"
          :error-message="errors.name?.[0]"
          :error="!!errors.name?.length"
          :rules="[validationRules.isRequired]"
        />
        <QSelect
          filled
          v-model="event.campaigns"
          :label="$t('events.edit.details.campaign')"
          :placeholder="$t('events.edit.details.campaignPlaceholder')"
          :multiple="true"
          :options="campaigns"
          option-label="name"
          option-value="id"
          map-options
          emit-value
          :error-message="errors.campaigns?.[0]"
          :error="!!errors.campaigns?.length"
        />
        <div class="row q-col-gutter-x-md">
          <DateTimeInput
            class="col"
            filled
            :input-props="{ label: $t('events.edit.details.startDate') }"
            :time-props="{ minuteOptions: [0, 15, 30, 45] }"
            :date-props="{ navigationMinYearMonth: currentYearMonth }"
            v-model="startDate"
            :mask="mask"
            :error-message="errors.start_date?.[0]"
            :error="!!errors.start_date?.length"
          />
          <DateTimeInput
            class="col"
            filled
            :input-props="{ label: $t('events.edit.details.endDate') }"
            :time-props="{ minuteOptions: [0, 15, 30, 45] }"
            :date-props="{ navigationMinYearMonth: currentYearMonth }"
            v-model="endDate"
            :mask="mask"
            :error-message="errors.end_date?.[0]"
            :error="!!errors.end_date?.length"
            :rules="[validationRules.isRequired]"
          />
        </div>
        <QInput
          filled
          v-if="event.event_type === EventTypes.GENERIC"
          v-model.number="event.external_url"
          :label="$t('events.edit.details.externalUrl')"
          :error-message="errors.external_url?.[0]"
          :error="!!errors.external_url?.length"
        />
        <QInput
          filled
          v-if="
            [
              EventTypes.DOOR_TO_DOOR,
              EventTypes.POSTERS,
              EventTypes.FLYERS
            ].includes(event.event_type)
          "
          v-model.number="event.messenger_url"
          :label="$t('events.edit.details.messengerUrl')"
          :error-message="errors.messenger_url?.[0]"
          :error="!!errors.messenger_url?.length"
          type="url"
        />
        <QInput
          filled
          v-if="
            [EventTypes.DOOR_TO_DOOR, EventTypes.FLYERS].includes(
              event.event_type
            )
          "
          :label="$t('events.edit.details.externalUrlDoorToDoor')"
          v-model.number="event.external_url_door"
          :error-message="errors.external_url_door?.[0]"
          :error="!!errors.external_url_door?.length"
          label-slot
        />
        <QInput
          filled
          type="textarea"
          :label="$t('events.edit.details.publicDescription')"
          v-model="event.description"
          :error-message="errors.description?.[0]"
          :error="!!errors.description?.length"
        />
        <QInput
          v-if="
            [
              EventTypes.DOOR_TO_DOOR,
              EventTypes.POSTERS,
              EventTypes.FLYERS
            ].includes(event.event_type)
          "
          filled
          type="textarea"
          :label="$t('events.edit.details.internalDescription')"
          v-model="event.internal_description"
          :error-message="errors.internal_description?.[0]"
          :error="!!errors.internal_description?.length"
        />
        <QSelect
          filled
          v-if="event.event_type !== EventTypes.GENERIC"
          :label="$t('events.edit.details.visibility')"
          v-model="event.visibility"
          :options="Object.values(VisibilityOptions)"
          :option-label="(item) => getLabel(item)"
          :error-message="errors.visibility?.[0]"
          :error="!!errors.visibility?.length"
        />
        <div v-if="event.event_type === EventTypes.POSTERS">
          <QCheckbox
            v-model="event.poster_creation_allowed"
            :label="$t('events.edit.details.posterCreationAllowed')"
          />
        </div>
      </QForm>
    </QScrollArea>
  </div>
  <SidebarBottomStepNavigation
    class="navigation"
    @forward="next"
    @back="back"
    :last="stepControls.isLastStep.value"
  />
</template>

<style lang="scss" scoped>
.control-buttons {
  margin: 1rem 0;
}

.metrics-headline {
  font-size: 1.2rem;
  margin: 0;
}

.metrics-input-wrapper {
  display: flex;
  flex-direction: column;
  background: $grey-2;
}

.container {
  flex: 1;
  margin-top: 1rem;
}
</style>
