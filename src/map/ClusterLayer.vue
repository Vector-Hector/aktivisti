<script lang="ts">
import { defineComponent, inject, onMounted, PropType, h, watch, onUnmounted } from 'vue'
import { MapInject } from './Map.vue'
import { uuidv4 } from 'src/utils/uuid'
import { ClusterDto } from 'src/api/model/ClusterDto'
import { GeoJSON } from 'geojson'
import maplibregl from 'maplibre-gl'

const TRANSITION_DURATION = 500
const MIN_CIRCLE_RADIUS = 20
const CIRCLE_SPAN = 120

class ClusterLayer {
  uuid = uuidv4()
  sourceId = `${this.uuid}-clusters`
  clusterCountLayerId = `${this.uuid}-cluster-count`
  clusterLayerId = `${this.uuid}-clusters`
  loaded = false

  constructor(private map: maplibregl.Map, private clusters: ClusterDto[]) {
  }

  add() {
    const clusterGeoJson: GeoJSON = {
      type: 'FeatureCollection',
      features: this.clusters.map((clusterItem: ClusterDto) => {
        return {
          type: 'Feature',
          properties: {
            count: clusterItem.count,
            id: clusterItem.cluster_id
          },
          geometry: {
            type: 'Point',
            coordinates: [clusterItem.centroid.lng, clusterItem.centroid.lat]
          }
        }
      })
    }
    const total = this.clusters.reduce((acc, item) => acc + item.count, 0)

    this.map.addSource(this.sourceId, {
      type: 'geojson',
      data: clusterGeoJson
    })
    this.map.addLayer({
      id: this.clusterLayerId,
      type: 'circle',
      source: this.sourceId,
      filter: ['has', 'count'],
      layout: {},
      paint: {
        'circle-color': '#DF0303',
        'circle-radius':
          ['+', MIN_CIRCLE_RADIUS, ['*',
            ['/', ['get', 'count'], total],
            CIRCLE_SPAN
          ]],
        'circle-opacity': 0,
        'circle-opacity-transition': {duration: TRANSITION_DURATION}
      }
    })

    this.map.addLayer({
      id: this.clusterCountLayerId,
      type: 'symbol',
      source: this.sourceId,
      filter: ['has', 'count'],
      layout: {
        'text-field': '{count}',
        'text-font': ['Roboto Bold'],
        'text-size': 14
      },
      paint: {
        'text-color': '#ffffff',
        'text-opacity': 0,
        'text-opacity-transition': {duration: TRANSITION_DURATION}
      }
    })
    this.map.setPaintProperty(this.clusterLayerId, 'circle-opacity', 1)
    this.map.setPaintProperty(this.clusterCountLayerId, 'text-opacity', 1)
    this.loaded = true
  }

  remove() {
    if (this.loaded) {
      this.loaded = false
      this.map.setPaintProperty(this.clusterLayerId, 'circle-opacity', 0)
      this.map.setPaintProperty(this.clusterCountLayerId, 'text-opacity', 0)
      setTimeout(() => {
        this.map.removeLayer(this.clusterLayerId)
        this.map.removeLayer(this.clusterCountLayerId)
        this.map.removeSource(this.sourceId)
      }, TRANSITION_DURATION)
    }
  }
}

export default defineComponent({
  name: 'ClusterLayer',
  props: {
    clusters: {
      type: Object as PropType<ClusterDto[]>,
      required: true
    }
  },
  emits: ['update:location'],
  setup(props) {
    const map = inject(MapInject)!
    let activeOverlay: ClusterLayer | null = null

    onMounted(() => {
      watch(() => props.clusters, () => {
        activeOverlay?.remove()
        activeOverlay = new ClusterLayer(map.value!, props.clusters)
        activeOverlay.add()
      }, {deep: true, immediate: true})
    })

    onUnmounted(() => {
      activeOverlay?.remove()
    })
  },
  render() {
    return h('span')
  }
})

</script>
