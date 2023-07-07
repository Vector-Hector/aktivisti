<script setup lang="ts">
import InfiniteList from 'components/InfiniteList.vue'
import { PropType, ref, computed } from 'vue'
import { CampaignDto } from 'src/api/model/CampaignDto'
import {
  EventGeoJsonDto,
  EventGeoJsonFeature
} from 'src/api/model/EventGeoJsonDto'
import EventOverviewItem from 'pages/event-map/overview/list/EventOverviewItem.vue'

const props = defineProps({
  campaigns: {
    type: Array as PropType<CampaignDto[]>,
    default: () => []
  },
  events: {
    type: Array as PropType<EventGeoJsonFeature[]>,
    required: true
  }
})

const emit = defineEmits(['clickOnEvent'])

function handleClickOnEvent(event: EventGeoJsonDto) {
  emit('clickOnEvent', event)
}

const maxVisibleItems = ref(10)

const visibleItems = computed(() => {
  return props.events?.slice(0, maxVisibleItems.value)
})

function addToVisibile(index, done) {
  maxVisibleItems.value += 10
  done()
}
</script>
<template>
  <InfiniteList
    :items="visibleItems"
    :disable="maxVisibleItems >= events.length"
    @load="addToVisibile"
    ref="infiniteList"
  >
    <template v-slot:item="{ item }">
      <EventOverviewItem
        clickable
        v-ripple
        @click="handleClickOnEvent(item)"
        :event="item"
        :campaigns="campaigns"
      />
    </template>
    <template v-slot:emptyList> Keine Aktionen im Gebiet gefunden</template>
  </InfiniteList>
</template>
