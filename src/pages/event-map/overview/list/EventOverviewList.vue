<script setup lang="ts">
import InfiniteList from 'components/InfiniteList.vue'
import { ref, computed } from 'vue'
import { CampaignDto } from 'src/api/model/CampaignDto'
import { EventGeoJsonFeature } from 'src/api/model/EventGeoJsonDto'
import EventOverviewItem from 'pages/event-map/overview/list/EventOverviewItem.vue'

interface Props {
  campaigns?: CampaignDto[]
  events: EventGeoJsonFeature[]
}

interface Emits {
  (e: 'clickOnEvent', event: EventGeoJsonFeature): void
}

const props = withDefaults(defineProps<Props>(), {
  campaigns: () => []
})

const emit = defineEmits<Emits>()

function handleClickOnEvent(event: EventGeoJsonFeature) {
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
  >
    <template v-slot:item="{ item }">
      <EventOverviewItem
        clickable
        v-ripple
        @click="handleClickOnEvent(item)"
        :event="item"
        :campaigns="props.campaigns"
      />
    </template>
    <template v-slot:emptyList> {{ $t('events.noEventsFound') }}</template>
  </InfiniteList>
</template>
