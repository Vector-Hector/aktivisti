<template>
  <Geocoder
    :access-token="accessToken"
    :collapsed="true"
    position="top-left"
    :countries="['de']"
  />
  <span v-if="isShowCluster">
    <ClusterLayer
      :clusters="clusters"
    />
  </span>
  <span
    v-else
    v-for="office in offices"
    :key="office.id"
  >
      <OfficeMarker v-if="!officeHoveredOver || office.id !== officeHoveredOver.id"
                    :location="office.location"
      >
        <OfficePopup
          :address="office.location_description"
          :office-id="office.id"
          />
      </OfficeMarker>
      <SelectedMarker v-if="officeHoveredOver && office.id === officeHoveredOver.id"
                      :location="office.location" />
    </span>
</template>
<script lang="ts">
import { defineComponent, inject, onUnmounted, ref } from 'vue'
import OfficeOverviewMixin from 'pages/office-map/overview/OfficeOverviewMixin'
import { MapInject } from 'src/mapbox/Map.vue'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { bboxPolygon } from '@turf/turf'
import OfficeMarker from 'components/OfficeMarker.vue'
import Geocoder from 'src/mapbox/Geocoder.vue'
import { userStore } from 'src/store/UserStore'
import SelectedMarker from 'components/SelectedMarker.vue'
import { MAX_EPS_DISTANCE_FOR_CLUSTERING, OFFICE_LIST_CHUNK_SIZE } from 'src/constants'
import ClusterLayer from 'src/mapbox/ClusterLayer.vue'
import { ClusterDto } from 'src/api/model/ClusterDto'
import OfficePopup from 'src/mapbox/popup/popups/OfficePopup.vue'

export default defineComponent({
  name: 'OfficeOverviewMap',
  components: {OfficePopup, ClusterLayer, SelectedMarker, Geocoder, OfficeMarker},
  mixins: [OfficeOverviewMixin],
  data() {
    return {
      clusters: [] as ClusterDto[]
    }
  },
  setup() {
    const map = inject(MapInject)!
    let bounds = ref(userStore.getState().bbox)
    const updateBounds = () => {
      bounds.value = map.value?.getBounds().toArray().flat() as BBox2d
    }
    map.value.on('zoomend', updateBounds)
    map.value.on('moveend', updateBounds)
    onUnmounted(() => {
      map.value.off('zoomend', updateBounds)
      map.value.off('moveend', updateBounds)
    })
    updateBounds()
    return {
      bounds,
      map
    }
  },
  computed: {
    accessToken() {
      return process.env.APP_MAPBOX_TOKEN
    },
    isShowCluster(): boolean {
      if (this.pagination.total) {
        return this.pagination.total > OFFICE_LIST_CHUNK_SIZE
      } else {
        return false
      }
    }
  },
  methods: {
    async updateWithinFilter(polygon: BBox2d) {
      await this.updateFilterParams({
        within: bboxPolygon(polygon).geometry
      })
    },
    async updateClusters() {
      const widthOfBounds = Math.abs(this.bounds![2] - this.bounds![0])
      let eps_radius = widthOfBounds / 15
      if (eps_radius > MAX_EPS_DISTANCE_FOR_CLUSTERING) {
        eps_radius = MAX_EPS_DISTANCE_FOR_CLUSTERING
      }
      const clusterResponse = await this.$apiClient.officeClusters.list(
        {
          ...this.filterParams,
          eps_radius: eps_radius
        }
      )
      this.clusters = clusterResponse.payload.data
    }
  },
  async created() {
    await this.updateWithinFilter(this.bounds as BBox2d)
    if (this.isShowCluster) {
      await this.updateClusters()
    }
  },
  watch: {
    bounds: async function(newBound) {
      await this.updateWithinFilter(newBound)
      if (this.isShowCluster) {
        await this.updateClusters()
      }
    }
  }
})

</script>
