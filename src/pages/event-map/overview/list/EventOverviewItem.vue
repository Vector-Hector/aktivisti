<script setup lang="ts">
import { computed } from 'vue'
import { QItem, QItemLabel, QItemSection } from 'quasar'
import { CampaignDto } from 'src/api/model/CampaignDto'
import { eventTypeOptions } from 'src/api/model/EventTypes'
import { EventGeoJsonFeature } from 'src/api/model/EventGeoJsonDto'

interface Props {
  event: EventGeoJsonFeature
  campaigns: CampaignDto[]
}

interface Emits {
  (e: 'click', event: EventGeoJsonFeature): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const eventTypeLabel = computed(() => {
  return eventTypeOptions.find(
    ({ key }) => key === props.event.properties.event_type
  )?.label
})

function campaignsByIds(findIds: number[]): CampaignDto[] {
  return props.campaigns.filter(({ id }) => findIds.includes(id))
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
        {{ $utils.dateFormat(event.properties.start_date) }}
      </QItemLabel>
    </QItemSection>
  </QItem>
</template>
<style lang="scss" scoped></style>
