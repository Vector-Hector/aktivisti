<script setup lang="ts">
import { onMounted } from 'vue'
import { useOfficeDetailMixin } from 'pages/office-map/detail/OfficeDetailMixin'
import { useInjectMapMixin } from 'pages/event-detail/InjectMapMixin'
import { bbox, circle } from '@turf/turf'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import SelectedMarker from 'components/SelectedMarker.vue'

const { office } = useOfficeDetailMixin()
const { map } = useInjectMapMixin()
onMounted(() => {
  const minShownAreaAroundLocation = bbox(
    circle([office.value!.location.lng, office.value!.location.lat], 0.2)
  ) as BBox2d
  map.value?.fitBounds(minShownAreaAroundLocation)
})
</script>

<template>
  <SelectedMarker v-if="office?.location" :location="office.location" />
</template>
