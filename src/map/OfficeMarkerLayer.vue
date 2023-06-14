<template>
  <span v-for="office in offices" :key="office.id">
    <OfficeMarker :is-grayed-out="true" :location="office.location">
      <OfficePopup
        :address="office.location_description"
        :office-id="office.id"
      />
    </OfficeMarker>
  </span>
</template>
<script lang="ts">
import { defineComponent, onUnmounted, ref } from 'vue'
import OfficeMarker from 'components/OfficeMarker.vue'
import { OfficeDto } from 'src/api/model/OfficeDto'
import { useMap } from 'src/map/Map.vue'
import { userStore } from 'src/store/UserStore'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { bboxPolygon } from '@turf/turf'
import OfficePopup from 'src/map/popup/markerPopups/OfficePopup.vue'

export default defineComponent({
  name: 'OfficeMarkerLayer',
  components: { OfficeMarker, OfficePopup },
  data() {
    return {
      offices: [] as OfficeDto[]
    }
  },
  setup() {
    const map = useMap()
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
  async created() {
    await this.updateOffices(this.bounds as BBox2d)
  },
  methods: {
    async updateOffices(bbox: BBox2d) {
      if (this.map.getZoom() && this.map.getZoom() > 13) {
        const response = await this.$apiClient.offices.list({
          within: bboxPolygon(bbox).geometry
        })
        this.offices = response.payload.data
      } else {
        this.offices = []
      }
    }
  },
  watch: {
    async bounds(newState: BBox2d) {
      await this.updateOffices(newState)
    }
  }
})
</script>
