<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import FeatureLayer from 'src/map/AreaFeatureLayer.vue'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { useInjectMapMixin } from 'src/pages/event-detail/InjectMapMixin'
import EventMarker from 'components/EventMarker.vue'
import { cloneDeep, isEqual } from 'lodash-es'
import { useEventStore } from 'src/stores/event'

const eventStore = useEventStore()
const { map } = useInjectMapMixin()

onMounted(() => {
  map.value?.fitBounds(eventStore.zoomBox as BBox2d, { animate: false })
})

const zoomBoxCopy = computed(() => {
  return cloneDeep(eventStore.zoomBox)
})

watch(
  zoomBoxCopy,
  (newValue, oldValue) => {
    if (newValue !== null && !isEqual(newValue, oldValue)) {
      map.value?.fitBounds(newValue as BBox2d)
    }
  },
  { deep: true }
)
</script>

<template>
  <EventMarker v-if="eventStore.event?.location" :event="eventStore.event" />
  <FeatureLayer :features="eventStore.areaFeatures" />
</template>

<style lang="scss" scoped></style>
