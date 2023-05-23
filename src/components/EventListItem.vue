<template>
  <QItem clickable v-ripple @click="$emit('click', event)">
    <QItemSection>
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
        {{ $utils.dateFormat(event.start_date) }}
      </QItemLabel>
    </QItemSection>
  </QItem>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { EventDto } from 'src/api/model/EventDto'
import { QItem, QItemLabel, QItemSection } from 'quasar'
import { CampaignDto } from 'src/api/model/CampaignDto'
import { eventTypeOptions } from 'src/api/model/EventTypes'

export default defineComponent({
  name: 'EventListItem',
  components: {
    QItem,
    QItemLabel,
    QItemSection
  },
  emits: ['click'],
  props: {
    event: {
      type: Object as PropType<EventDto>,
      required: true
    },
    campaigns: {
      type: Array as PropType<CampaignDto[]>,
      required: true
    }
  },
  computed: {
    eventTypeLabel(): string | undefined {
      return eventTypeOptions.find(({ key }) => key === this.event.event_type)
        ?.label
    }
  },
  methods: {
    campaignsByIds(findIds: number[]): CampaignDto[] {
      return this.campaigns.filter(({ id }) => findIds.includes(id))
    }
  }
})
</script>
<style lang="scss" scoped></style>
