<script lang="ts">
import { defineComponent, inject, onMounted, PropType, h, watch, onUnmounted } from 'vue'
import { MapInject } from './Map.vue'
import { uuidv4 } from '@/utils/uuid'
import { ClusterDto } from '@/api/model/ClusterDto'
import { GeoJSON } from 'geojson'

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
    const uuid = uuidv4()
    const map = inject(MapInject)!

    const sourceId = `${uuid}-clusters`
    const clusterCountLayerId = `${uuid}-cluster-count`
    const clusterLayerId = `${uuid}-clusters`
    let loadedLayers = false
    onMounted(() => {
      watch(() => props.clusters, () => {
        updateClusters()
      }, {deep: true, immediate: true})
    })

    onUnmounted(() => {
      map.value.removeLayer(clusterLayerId)
      map.value.removeLayer(clusterCountLayerId)
      map.value.removeSource(sourceId)
    })

    const updateClusters = () => {
      if (loadedLayers) {
        map.value.removeLayer(clusterLayerId)
        map.value.removeLayer(clusterCountLayerId)
        map.value.removeSource(sourceId)
      }
      const clusterGeoJson: GeoJSON = {
        type: 'FeatureCollection',
        features: props.clusters.map((clusterItem: ClusterDto) => {
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
      const total = props.clusters.reduce((acc, item) => acc + item.count, 0)
      const sizeSpan = 500

      map.value.addSource(sourceId, {
        type: 'geojson',
        data: clusterGeoJson
      })
      map.value.addLayer({
        id: clusterLayerId,
        type: 'circle',
        source: sourceId,
        filter: ['has', 'count'],
        paint: {
          'circle-color': '#DF0303',
          'circle-radius':
            ['*',
              ['/', ['get', 'count'], total],
              sizeSpan
            ]

        }
      })

      map.value.addLayer({
        id: clusterCountLayerId,
        type: 'symbol',
        source: sourceId,
        filter: ['has', 'count'],
        layout: {
          'text-field': '{count}',
          'text-font': ['Roboto Bold'],
          'text-size': 14
        },
        paint: {
          'text-color': '#ffffff'
        }
      })
      loadedLayers = true
    }
  },
  render() {
    return h('span')
  }
})

</script>
<style lang="scss" scoped>
@import "~@/scss/_variables.scss";

.marker-icon {
  background-image: url("~@/assets/marker.png");
  background-size: cover;
  display: block;
  width: 32px;
  height: 32px;
  cursor: pointer;
}
</style>
