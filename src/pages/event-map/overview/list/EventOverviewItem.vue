<script setup lang="ts">
import { computed } from 'vue'
import { QBtn, QItem, QItemLabel, QItemSection, useQuasar } from 'quasar'
import { CampaignDto } from 'src/api/model/CampaignDto'
import { useEventTypes } from 'src/api/model/EventTypes'
import { EventGeoJsonFeature } from 'src/api/model/EventGeoJsonDto'
import { ionPencil, ionPeopleSharp } from '@quasar/extras/ionicons-v5'
import EventParticipantsModal from 'components/modals/EventParticipantsModal.vue'
import { useDateFormat } from 'src/utils/dateFormat'

interface Props {
  event: EventGeoJsonFeature
  campaigns: CampaignDto[]
}

interface Emits {
  (e: 'click', event: EventGeoJsonFeature): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const q = useQuasar()
const { dateFormat } = useDateFormat()
const { eventTypeOptions } = useEventTypes()

const eventTypeLabel = computed(() => {
  return eventTypeOptions.find(
    ({ key }) => key === props.event.properties.event_type
  )?.label
})

function campaignsByIds(findIds: number[]): CampaignDto[] {
  return props.campaigns.filter(({ id }) => findIds.includes(id))
}

function openParticipantsModal() {
  q.dialog({
    component: EventParticipantsModal,
    maximized: true,
    componentProps: {
      eventId: props.event.id,
      eventSubAssociation: props.event.properties.sub_association
    }
  })
}
</script>
<template>
  <QItem tabindex="-1">
    <QItemSection clickable v-ripple tabindex="0" @click="emit('click', event)">
      <QItemLabel>
        <b>{{ event.properties.name }}</b>
      </QItemLabel>
      <QItemLabel v-if="eventTypeLabel">
        {{ eventTypeLabel }}
      </QItemLabel>
      <QItemLabel>
        {{
          campaignsByIds(event.properties.campaigns)
            .map(({ name }) => name)
            .join(',')
        }}
      </QItemLabel>
      <QItemLabel>
        {{ dateFormat(event.properties.start_date, 'datetime') }}
      </QItemLabel>
    </QItemSection>
    <QItemSection side>
      <div class="q-gutter-x-md">
        <QBtn
          v-if="event.properties.can_edit"
          aria-label="Aktion bearbeiten"
          round
          outline
          color="primary"
          :icon="ionPencil"
          :to="{ name: 'edit-event-details', params: { eventId: event.id } }"
        ></QBtn>
        <QBtn
          v-if="event.properties.can_edit_participants"
          aria-label="Teilnehmer:innen verwalten"
          round
          outline
          :icon="ionPeopleSharp"
          color="primary"
          @click="openParticipantsModal"
        ></QBtn>
      </div>
    </QItemSection>
  </QItem>
</template>
<style lang="scss" scoped></style>
