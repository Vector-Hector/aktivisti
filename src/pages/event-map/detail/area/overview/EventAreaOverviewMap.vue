<script setup lang="ts">
import { computed, onMounted } from 'vue'
import AreaFeatureLayer from 'src/map/AreaFeatureLayer.vue'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { bbox as tbbox } from '@turf/turf'
import { useInjectMapMixin } from 'pages/event-detail/InjectMapMixin'
import { useEventStore } from 'src/stores/event'

const eventStore = useEventStore()
const { map } = useInjectMapMixin()

onMounted(() => {
  map.value?.fitBounds(bbox.value as BBox2d)
})

const bbox = computed(() => {
  if (!eventStore.currentAreaFeature) return
  return tbbox(eventStore.currentAreaFeature) as BBox2d
})
</script>
<template>
  <AreaFeatureLayer :features="[eventStore.currentAreaFeature]" />
</template>

<style lang="scss" scoped></style>
