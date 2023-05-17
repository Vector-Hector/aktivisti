<template>
  <QItem
    tabindex="-1"
  >
    <QItemSection
      clickable
      v-ripple
      tabindex="0"
      @click="$emit('click', event)"
    >
      <QItemLabel>
        <b>{{ event.name }}</b>
      </QItemLabel>
      <QItemLabel v-if="eventTypeLabel">
        {{ eventTypeLabel }}
      </QItemLabel>
      <QItemLabel>
        {{ campaignsByIds(event.campaigns).map(({name}) => name).join(',') }}
      </QItemLabel>
      <QItemLabel>
        {{ $utils.dateFormat(event.start_date) }}
      </QItemLabel>
    </QItemSection>
    <QItemSection side v-if="showManagementControlButtons">
      <div class="q-gutter-x-md">
        <QBtn round :icon="ionPencil" color="primary" @click="test()"></QBtn>
        <QBtn round :icon="ionTrash" color="primary" @click="test()"></QBtn>
      </div>
    </QItemSection>
  </QItem>
</template>
<script lang="ts">

import { defineComponent, PropType } from 'vue'
import { EventDto } from 'src/api/model/EventDto'
import { QBtn, QItem, QItemLabel, QItemSection } from 'quasar'
import { ionPencil, ionTrash } from '@quasar/extras/ionicons-v5'
import { CampaignDto } from 'src/api/model/CampaignDto'
import { eventTypeOptions } from 'src/api/model/EventTypes'

export default defineComponent({
  name: 'EventListItem',
  components: {
    QBtn,
    QItem,
    QItemLabel,
    QItemSection
  },
  data() {
    return {
      ionPencil,
      ionTrash
    }
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
    },
    showManagementControlButtons: Boolean
  },
  computed: {
    eventTypeLabel(): string | undefined {
      return eventTypeOptions.find(({key}) => key === this.event.event_type)?.label
    }
  },
  methods: {
    campaignsByIds(findIds: number[]): CampaignDto[] {
      return this.campaigns.filter(({id}) => findIds.includes(id))
    },
    test(): void {
      console.log('Clicked')
    }
  }
})
</script>
<style lang="scss" scoped>
</style>
