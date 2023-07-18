import {
  defineComponent,
  inject,
  onMounted,
  PropType,
  h,
  watch,
  onUnmounted
} from 'vue'
import { MapInject } from './Map.vue'
import { uuidv4 } from 'src/utils/uuid'
import { Feature, FeatureCollection, Point } from 'geojson'
import maplibregl, {
  Expression,
  GeoJSONSource,
  StyleFunction
} from 'maplibre-gl'

const TRANSITION_DURATION = 500

class EventLayer {
  uuid = uuidv4()
  sourceId = `${this.uuid}-clusters`
  clusterCountLayerId = `${this.uuid}-cluster-count`
  clusterLayerId = `${this.uuid}-clusters`
  unclusteredPointId = `${this.uuid}-cluster-point`
  loaded = false

  constructor(
    private map: maplibregl.Map,
    private featureCollection: FeatureCollection,
    private iconImageValue: string | StyleFunction | Expression,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private eventClickCallback: (feature: Feature) => void = () => {},
    private clusterize = true
  ) {}

  add() {
    this.map.addSource(this.sourceId, {
      type: 'geojson',
      data: this.featureCollection,
      cluster: this.clusterize,
      clusterMaxZoom: 14
    })
    this.map.addLayer({
      id: this.clusterLayerId,
      type: 'circle',
      source: this.sourceId,
      filter: ['has', 'point_count'],
      layout: {},
      paint: {
        'circle-color': '#DF0303',
        'circle-radius': ['step', ['get', 'point_count'], 20, 10, 30, 30, 40],
        'circle-opacity': 0,
        'circle-opacity-transition': { duration: TRANSITION_DURATION }
      }
    })

    this.map.addLayer({
      id: this.clusterCountLayerId,
      type: 'symbol',
      source: this.sourceId,
      filter: ['has', 'point_count'],
      layout: {
        'text-field': ['get', 'point_count_abbreviated'],
        'text-font': ['Roboto Bold'],
        'text-size': 14
      },
      paint: {
        'text-color': '#ffffff',
        'text-opacity': 0,
        'text-opacity-transition': { duration: TRANSITION_DURATION }
      }
    })

    this.map.addLayer({
      id: this.unclusteredPointId,
      type: 'symbol',
      source: this.sourceId,
      filter: ['!', ['has', 'point_count']],
      layout: {
        'icon-image': this.iconImageValue,
        'icon-size': 0.32,
        'icon-anchor': 'bottom',
        'icon-allow-overlap': true
      }
    })
    this.map.on('click', this.unclusteredPointId, (e) => {
      if (e.features?.[0]) {
        this.eventClickCallback(e.features[0])
      }
    })

    this.map.on('mouseenter', this.unclusteredPointId, () => {
      this.map.getCanvas().style.cursor = 'pointer'
    })

    this.map.on('mouseleave', this.unclusteredPointId, () => {
      this.map.getCanvas().style.cursor = ''
    })

    this.map.on('mouseenter', this.clusterLayerId, () => {
      this.map.getCanvas().style.cursor = 'pointer'
    })
    this.map.on('mouseleave', this.clusterLayerId, () => {
      this.map.getCanvas().style.cursor = ''
    })
    // inspect a cluster on click
    this.map.on('click', this.clusterLayerId, (e) => {
      const features = this.map.queryRenderedFeatures(e.point, {
        layers: [this.clusterLayerId]
      })
      const clusterId = features[0]?.properties?.cluster_id
      const source = this.map.getSource(this.clusterLayerId) as GeoJSONSource
      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return

        this.map.easeTo({
          center: (features[0].geometry as Point).coordinates as [
            number,
            number
          ],
          zoom: zoom
        })
      })
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
        this.map.removeLayer(this.unclusteredPointId)
        this.map.removeSource(this.sourceId)
      }, TRANSITION_DURATION)
    }
  }
}

export default defineComponent({
  name: 'EventLayer',
  props: {
    featureCollection: {
      type: Object as PropType<FeatureCollection>,
      required: true
    },
    iconImageValue: {
      type: [Array, String] as PropType<string | StyleFunction | Expression>,
      required: true
    },
    iconName: {
      type: String
    },
    clusterize: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:location', 'featureClicked'],
  setup(props, { emit }) {
    const map = inject(MapInject)!
    let activeOverlay: EventLayer | null = null

    onMounted(() => {
      watch(
        () => props.featureCollection,
        () => {
          activeOverlay?.remove()
          activeOverlay = new EventLayer(
            map.value!,
            props.featureCollection,
            props.iconImageValue,
            (eventFeature) => {
              emit('featureClicked', eventFeature)
            },
            props.clusterize
          )
          activeOverlay.add()
        },
        { deep: true, immediate: true }
      )
    })

    onUnmounted(() => {
      activeOverlay?.remove()
    })
  },
  render() {
    return h('span')
  }
})
