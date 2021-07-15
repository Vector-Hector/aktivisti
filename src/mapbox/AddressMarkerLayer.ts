import { defineComponent, inject, watch, onMounted, PropType, onUnmounted, h } from 'vue'
import { MapInject } from './Map.vue'
import { uuidv4 } from 'src/utils/uuid'
import { AddressDetails } from 'src/api/model/AreaDetailsDto'
import { AllGeoJSON, center } from '@turf/turf'
import { GeoJSONSource } from 'mapbox-gl'


export default defineComponent({
  name: 'AddressMarkerLayer',
  props: {
    addresses: {
      type: Array as PropType<AddressDetails[]>,
      required: true
    }
  },
  setup(props) {
    const uuid = uuidv4()
    const map = inject(MapInject)!

    const sourceId = `${uuid}-source`

    const layers: string[] = []

    onMounted(() => {
      map?.value.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      })

      watch(() => props.addresses, () => {
        (map?.value.getSource(sourceId) as GeoJSONSource)?.setData({
          type: 'FeatureCollection',
          features: props.addresses.map((address: AddressDetails) => {
            return {
              type: 'Feature',
              properties: {
                house_number: address.house_number
              },
              geometry: center(address.geometry as AllGeoJSON).geometry
            }
          })
        })
      }, { immediate: true })

      const circlesId = `${uuid}-circle`
      const captionId = `${uuid}-caption`

      layers.push(
        circlesId,
        captionId
      )
      map?.value.addLayer({
        id: circlesId,
        type: 'circle',
        source: sourceId,
        layout: {},
        paint: {
          'circle-color': '#FFFFFF',
          'circle-radius': 12,
          'circle-stroke-color': '#000000',
          'circle-stroke-width': 1
        }
      })

      map?.value.addLayer({
        id: captionId,
        type: 'symbol',
        source: sourceId,
        layout: {
          'text-field': '{house_number}',
          'text-font': ['Roboto Regular'],
          'text-size': 11,
          'text-line-height': 1.0,
          'text-offset': [0, .1],
          'text-allow-overlap': true
        },
        paint: {
          'text-color': '#000000'
        }
      })
    })
    onUnmounted(() => {
      layers.forEach((layerId) => {
        map?.value?.removeLayer(layerId)
      })
      map?.value?.removeSource(sourceId)
    })
  },
  render() {
    return h('span')
  }
})
