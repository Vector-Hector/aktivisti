import { computed } from 'vue'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { bbox as bboxTurf, bboxPolygon, transformScale } from '@turf/turf'
import { FeatureCollection } from 'geojson'
import { useEventStore } from 'src/stores/event'

export function useEventAreaStreetComposable(props) {
  const eventStore = useEventStore()

  const addresses = computed(() => {
    return eventStore.eventArea?.area_details?.streets.find(
      ({ name }) => name === props.street
    )?.addresses
  })

  const bbox = computed(() => {
    if (!addresses.value) return
    const featureCollection: FeatureCollection = {
      type: 'FeatureCollection',
      features: addresses.value.map((address) => {
        return {
          type: 'Feature',
          geometry: address.geometry,
          properties: {}
        }
      })
    }
    return bboxTurf(
      transformScale(bboxPolygon(bboxTurf(featureCollection)), 1.4)
    ) as BBox2d
  })

  return { addresses, bbox }
}
