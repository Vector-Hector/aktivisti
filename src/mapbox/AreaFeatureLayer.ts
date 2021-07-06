import { defineComponent, inject, onMounted, PropType, onUnmounted, h } from 'vue'
import { MapInject } from './Map.vue'
import { uuidv4 } from 'src/utils/uuid'
import { Feature } from 'geojson'
import { getColorFromPropertiesWithDefault } from 'pages/edit-event/geometry/route-planner.styles'


export default defineComponent({
  name: 'FeatureLayer',
  props: {
    features: {
      type: Object as PropType<Feature[]>,
      required: true
    }
  },
  emits: ['update:location'],
  setup(props) {
    const uuid = uuidv4()
    const map = inject(MapInject)!

    const layers: string[] = []
    onMounted(() => {
      map?.value.addSource(uuid, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: props.features
        }
      })
      const fillLayer = `${uuid}-fill`
      const outlineLayer = `${uuid}-outline`

      layers.push(
        fillLayer,
        outlineLayer
      )
      map?.value.addLayer({
        'id': `${uuid}-fill`,
        type: 'fill',
        source: uuid,
        paint: {
          // @ts-ignore
          'fill-color': getColorFromPropertiesWithDefault('#000', 'color'),
          'fill-opacity': 0.1
        }
      })
      map?.value.addLayer({
        id: `${uuid}-outline`,
        type: 'line',
        source: uuid,
        paint: {
          // @ts-ignore
          'line-color': getColorFromPropertiesWithDefault('#000', 'color')
        }
      })
    })

    onUnmounted(() => {
      layers.forEach((layerId) => {
        map?.value?.removeLayer(layerId)
      })
    })

  },
  render() {
    return h('span')
  }
})
