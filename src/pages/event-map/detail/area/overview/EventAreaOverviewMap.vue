<script setup lang="ts">
import { computed, onMounted } from 'vue'
import AreaFeatureLayer from 'src/map/AreaFeatureLayer.vue'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { bbox as tbbox } from '@turf/turf'
import { useInjectMapMixin } from 'pages/event-detail/InjectMapMixin'
import { useEventDetailStore } from 'pages/event-map/detail/EventDetailStoreMixin'

const { currentAreaFeature } = useEventDetailStore()
const { map } = useInjectMapMixin()

onMounted(() => {
  map.value?.fitBounds(bbox.value as BBox2d)
})

const bbox = computed(() => {
  if (!currentAreaFeature.value) return
  return tbbox(currentAreaFeature.value) as BBox2d
})
</script>
<template>
  <AreaFeatureLayer :features="[currentAreaFeature]" />
</template>

<style lang="scss" scoped></style>
