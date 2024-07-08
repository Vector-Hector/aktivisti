<script setup lang="ts">
import { onMounted } from 'vue'
import { useInjectMapMixin } from 'src/pages/event-detail/InjectMapMixin'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { Geometry } from 'geojson'
import { center as turfCenter } from '@turf/turf'
import { LocationDto } from 'src/api/model/LocationDto'
import AddressMarker from 'src/map/AddressMarker.vue'
import { AddressDetails } from 'src/api/model/AreaDetailsDto'
import { useEventAreaStreetComposable } from 'pages/event-map/detail/area/street/EventAreaStreetMixin'
import { useRoute, useRouter } from 'vue-router'
import { useEventAreaMetricsComposable } from './EventAreaMetricsMixin'
import { useEventDetailStore } from '../../EventDetailStoreMixin'

interface Props {
  houseNumber: string
  street: string
  areaId: string
}
const props = defineProps<Props>()

const $router = useRouter()
const $route = useRoute()

const { addresses } = useEventAreaStreetComposable(props)
const { completedTargetIds } = useEventDetailStore()
const { bbox } = useEventAreaMetricsComposable(props)
const { map } = useInjectMapMixin()

onMounted(() => {
  map.value?.fitBounds(bbox.value as BBox2d)
})

function center(geometry: Geometry): LocationDto {
  //@ts-ignore
  const point = turfCenter(geometry)
  return {
    lat: point.geometry.coordinates[1],
    lng: point.geometry.coordinates[0]
  }
}

async function jumpToAddress(address: AddressDetails) {
  await $router.replace({
    name: 'event-detail-area-metrics',
    params: {
      houseNumber: address.house_number,
      street: props.street
    }
  })
}
</script>
<template>
  <AddressMarker
    v-for="address in addresses"
    :key="address.house_number"
    :location="center(address.geometry)"
    :text="address.house_number"
    :selected="$route.params.houseNumber === address.house_number"
    :done="completedTargetIds.includes(address.osm_id.toString())"
    @click="jumpToAddress(address)"
  />
</template>
