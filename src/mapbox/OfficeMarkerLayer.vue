<template>
  <span v-for="office in offices" :key="office.id">
  <OfficeMarker
    :is-grayed-out="true"
    :location="office.location"
  >
    <Popup>
          <div class="popup-contents">
            <span class="popup-title">DIE LINKE vor Ort</span>
            <span class="popup-address">{{ office.location_description }}</span>
            <QBtn
              label="Mehr Infos"
              color="primary"
              :to="`/offices/${office.id}`"
            />
          </div>
    </Popup>
  </OfficeMarker>
  </span>
</template>
<script lang="ts">

import { defineComponent, inject, onUnmounted, ref } from 'vue'
import OfficeMarker from 'components/OfficeMarker.vue'
import { OfficeDto } from 'src/api/model/OfficeDto'
import { MapInject } from 'src/mapbox/Map.vue'
import { userStore } from 'src/store/UserStore'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { bboxPolygon } from '@turf/turf'
import Popup from 'src/mapbox/Popup.vue'
import { QBtn } from 'quasar'

export default defineComponent({
  name: 'OfficeMarkerLayer',
  components: {QBtn, Popup, OfficeMarker},
  data() {
    return {
      offices: [] as OfficeDto[]
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
  async created() {
    await this.updateOffices(this.bounds as BBox2d)
  },
  methods: {
    async updateOffices(bbox: BBox2d) {
      if (this.map.getZoom() && this.map.getZoom() > 13) {
        const response = await this.$apiClient.offices.list({within: bboxPolygon(bbox).geometry})
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
<style lang="scss" scoped>
.popup-contents {
  display: flex;
  flex-direction: column;
}

.popup-title {
  font-weight: bold;
  display: block;
  font-size: 1rem;
}

.popup-address {
  display: block;
  font-size: 0.9rem;
}
</style>
