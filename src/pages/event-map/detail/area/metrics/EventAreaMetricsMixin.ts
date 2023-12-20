import { computed } from 'vue'
import { bbox as bboxTurf, center, circle } from '@turf/turf'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { useEventAreaStreetComposable } from 'pages/event-map/detail/area/street/EventAreaStreetMixin'

export function useEventAreaMetricsComposable(props) {
  const { addresses } = useEventAreaStreetComposable(props)

  const address = computed(() => {
    return addresses.value?.find(
      ({ house_number }) => house_number === props.houseNumber
    )
  })

  const location = computed(() => {
    if (!address.value?.geometry) return
    //@ts-ignore
    return center(address.value.geometry)
  })

  const bbox = computed(() => {
    if (!location.value) return
    return bboxTurf(circle(location.value, 0.05)) as BBox2d
  })

  return { address, location, bbox }
}
