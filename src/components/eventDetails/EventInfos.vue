<script setup lang="ts">
import { EventDto } from 'src/api/model/EventDto'
import { useEventTypes, EventTypes } from 'src/api/model/EventTypes'
import { useDateFormat } from 'src/utils/dateFormat'
import { computed } from 'vue'

interface Props {
  event: EventDto
  showParticpants: boolean
}

const props = defineProps<Props>()

const { dateFormat } = useDateFormat()
const { eventTypeOptions } = useEventTypes()

const eventTypeLabel = computed(() => {
  return eventTypeOptions.find(({ key }) => key === props.event.event_type)
    ?.label
})
</script>
<template>
  <div class="row q-gutter-sm">
    <div class="col">
      <div class="row q-col-gutter-sm event-details">
        <div class="col-4">
          <b>{{ $t('events.details.eventType') }}:</b>
        </div>
        <div class="col-8">
          {{ eventTypeLabel }}
        </div>
        <div class="col-4">
          <b>{{ $t('events.details.meetingPoint') }}:</b>
        </div>
        <div class="col-8">
          {{ props.event.location_description }}
        </div>
        <div class="col-4">
          <b>{{ $t('events.details.startDate') }}:</b>
        </div>
        <div class="col-8">
          {{ dateFormat(props.event.start_date, 'datetime') }}
        </div>
        <div class="col-4">
          <b>{{ $t('events.details.endDate') }}:</b>
        </div>
        <div class="col-8">
          {{ dateFormat(props.event.end_date, 'datetime') }}
        </div>
        <template v-if="props.event.external_url">
          <div class="col-4">
            <b>{{ $t('events.details.externalUrl') }}:</b>
          </div>
          <div class="col-8">
            <a
              target="_blank"
              class="primary-link"
              :href="props.event.external_url"
              >{{ props.event.external_url }}</a
            >
          </div>
        </template>
        <template v-if="props.event.messenger_url">
          <div class="col-4">
            <b>{{ $t('events.details.messangerUrl') }}:</b>
          </div>
          <div class="col-8">
            <a
              target="_blank"
              class="primary-link"
              :href="props.event.messenger_url"
              >{{ props.event.messenger_url }}</a
            >
          </div>
        </template>
        <template
          v-if="
            props.showParticpants &&
            props.event.event_type !== EventTypes.GENERIC
          "
        >
          <div class="col-4">
            <b>{{ $t('events.details.participants') }}:</b>
          </div>
          <div class="col-8">
            {{ props.event.participants }}
          </div>
        </template>
      </div>
    </div>
    <div class="col-auto column">
      <slot />
    </div>
  </div>
  <div class="row">
    <div class="col-12 event-description">
      <b>{{ $t('events.details.publicDescription') }}</b
      ><br />
      {{ props.event.description }}
    </div>
  </div>
  <div v-if="props.event.internal_description" class="row">
    <div class="col-12 event-description">
      <b>{{ $t('events.details.internalDescription') }}</b
      ><br />
      {{ props.event.internal_description }}
    </div>
  </div>
</template>
<style lang="scss" scoped>
.event-details {
  font-size: 1rem;
}
.event-description {
  font-size: 1rem;
  white-space: pre-line;
  margin-bottom: 1rem;
}
</style>
