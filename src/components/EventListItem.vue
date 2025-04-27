<script setup lang="ts">
import { computed } from 'vue'
import { EventDto } from 'src/api/model/EventDto'
import { QBtn, QItem, QItemLabel, QItemSection, useQuasar } from 'quasar'
import { ionPencil, ionTrash } from '@quasar/extras/ionicons-v5'
import { CampaignDto } from 'src/api/model/CampaignDto'
import { eventTypeOptions } from 'src/api/model/EventTypes'
import { openDeleteEventDialog } from 'src/utils/dialog'
import { useDateFormat } from 'src/utils/dateFormat'

interface Props {
  event: EventDto
  campaigns: CampaignDto[]
  showManagementControlButtons?: boolean
}
const props = defineProps<Props>()

interface Emits {
  // Fixme(peter@ctrl.alt.coop): click doesn't need to emit the event,
  // since it's part of the props the outer component should already
  // know what event it is.
  (e: 'click', event: EventDto): void
  (e: 'delete'): void
}
const emit = defineEmits<Emits>()

const { dateFormat } = useDateFormat()
const $q = useQuasar()

const eventTypeLabel = computed(() => {
  return eventTypeOptions.find(({ key }) => key === props.event.event_type)
    ?.label
})

function campaignsByIds(findIds: number[]): CampaignDto[] {
  return props.campaigns.filter(({ id }) => findIds.includes(id))
}
function openDeleteModal() {
  openDeleteEventDialog($q, props.event)
    .then(() => emit('delete'))
    .catch(console.error)
}
</script>

<template>
  <QItem tabindex="-1">
    <QItemSection clickable v-ripple tabindex="0" @click="emit('click', event)">
      <QItemLabel>
        <b>{{ event.name }}</b>
      </QItemLabel>
      <QItemLabel v-if="eventTypeLabel">
        {{ eventTypeLabel }}
      </QItemLabel>
      <QItemLabel>
        {{
          campaignsByIds(event.campaigns)
            .map(({ name }) => name)
            .join(',')
        }}
      </QItemLabel>
      <QItemLabel>
        {{ dateFormat(event.start_date, 'datetime') }}
      </QItemLabel>
    </QItemSection>
    <QItemSection side v-if="showManagementControlButtons">
      <div class="q-gutter-x-md">
        <QBtn
          round
          :icon="ionPencil"
          color="primary"
          :to="{ name: 'edit-event-details', params: { eventId: event.id } }"
        ></QBtn>
        <QBtn
          round
          :icon="ionTrash"
          color="primary"
          @click="openDeleteModal()"
        ></QBtn>
      </div>
    </QItemSection>
  </QItem>
</template>
<style lang="scss" scoped></style>
