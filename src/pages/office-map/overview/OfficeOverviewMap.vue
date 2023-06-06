<template>
  <Geocoder :collapsed="true" position="top-left" :countries="['de']" />

  <ClusterLayer
    v-if="officeFeatureCollection"
    :feature-collection="officeFeatureCollection"
    :icon-image-value="'office'"
    @feature-clicked="activeOffice = $event"
  />
  <CoordinatesPopup
    v-if="activeOffice"
    :coordinates="activeOffice.geometry.coordinates"
    @close="activeOffice = null"
  >
    <OfficePopupContents v-if="activeOffice" :office="activeOffice">
    </OfficePopupContents>
  </CoordinatesPopup>
</template>
<script lang="ts">
import { defineComponent, inject, onUnmounted, ref } from 'vue'
import { MapInject } from 'src/map/Map.vue'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import Geocoder from 'src/map/Geocoder.vue'
import { userStore } from 'src/store/UserStore'
import { OFFICE_LIST_CHUNK_SIZE } from 'src/constants'
import ClusterLayer from 'src/map/ClusterLayer'
import { ClusterDto } from 'src/api/model/ClusterDto'
import useOverviewMixin from 'src/utils/useOverviewMixin'
import { OfficeDto } from 'src/api/model/OfficeDto'
import { OfficeFilterParams } from 'src/api/params/OfficeFilterParams'
import { officeOverviewStore } from 'src/store/OfficeOverviewStore'
import { apiClient } from 'src/api/ApiClient'
import {
  OfficeGeoJsonDto,
  OfficeGeoJsonFeature
} from 'src/api/model/OfficeGeoJsonDto'
import { loadImageIfNonExistent } from 'src/utils/map'
import CoordinatesPopup from 'src/map/popup/CoordinatesPopup.vue'
import OfficePopupContents from 'src/map/popup/OfficePopupContents.vue'

export default defineComponent({
  name: 'OfficeOverviewMap',
  components: {
    OfficePopupContents,
    CoordinatesPopup,
    ClusterLayer,
    Geocoder
  },
  data() {
    return {
      clusters: [] as ClusterDto[],
      activeOffice: null as null | OfficeGeoJsonFeature
    }
  },
  setup() {
    const map = inject(MapInject)!
    const bounds = ref(userStore.getState().bbox)
    const officeFeatureCollection = ref<OfficeGeoJsonDto | null>(null)
    void apiClient.officeGeometry.list().then((offices) => {
      officeFeatureCollection.value = offices.payload.data
    })
    const updateBounds = () => {
      bounds.value = map.value?.getBounds().toArray().flat() as BBox2d
    }
    map.value.on('zoomend', updateBounds)
    map.value.on('moveend', updateBounds)

    void loadImageIfNonExistent(
      map.value,
      'office',
      '/static/icons/map-pin-office.png'
    )

    onUnmounted(() => {
      map.value.off('zoomend', updateBounds)
      map.value.off('moveend', updateBounds)
    })
    updateBounds()
    const {
      filterParams,
      itemHoveredOver: officeHoveredOver,
      items: offices,
      pagination,
      updateFilterParams
    } = useOverviewMixin<OfficeDto, OfficeFilterParams>(
      officeOverviewStore,
      apiClient.offices
    )
    return {
      filterParams,
      officeHoveredOver,
      offices,
      pagination,
      updateFilterParams,
      bounds,
      map,
      officeFeatureCollection
    }
  },
  computed: {
    isShowCluster(): boolean {
      if (this.pagination.total) {
        return this.pagination.total > OFFICE_LIST_CHUNK_SIZE
      } else {
        return false
      }
    }
  }
})
</script>
