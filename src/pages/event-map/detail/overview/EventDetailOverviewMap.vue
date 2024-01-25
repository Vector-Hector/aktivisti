<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import FeatureLayer from 'src/map/AreaFeatureLayer.vue'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { useInjectMapMixin } from 'src/pages/event-detail/InjectMapMixin'
import EventMarker from 'components/EventMarker.vue'
import { cloneDeep, isEqual } from 'lodash-es'
import { useEventDetailStore } from 'pages/event-map/detail/EventDetailStoreMixin'

const { event, areaFeatures, zoomBox } = useEventDetailStore()
const { map } = useInjectMapMixin()

onMounted(() => {
  map.value?.fitBounds(zoomBox.value as BBox2d, { animate: false })
})

const zoomBoxCopy = computed(() => {
  return cloneDeep(zoomBox.value)
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
  <EventMarker v-if="event?.location" :event="event" />
  <FeatureLayer :features="areaFeatures" />
</template>

<style lang="scss" scoped></style>
