<template>
  <Geocoder :collapsed="true" position="top-left" :countries="['de']" />
  <PosterPopup ref="posterPopup" />
  <PosterMarkerLayer :posters="posters" @posterClick="handlePosterClick" />
</template>
<script lang="ts">
import { defineComponent, onUnmounted, ref } from 'vue'
import { useMap } from 'src/map/Map.vue'
import { userStore } from 'src/store/UserStore'
import Geocoder from 'src/map/Geocoder.vue'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { bboxPolygon } from '@turf/turf'
import useOverviewMixin from 'src/utils/useOverviewMixin'
import { PosterDto } from 'src/api/model/PosterDto'
import { PosterFilterParams } from 'src/api/params/PosterFilterParams'
import { posterOverviewStore } from 'src/store/PosterOverviewStore'
import { apiClient } from 'src/api/ApiClient'
import PosterMarkerLayer from 'src/map/PosterMarkerLayer'
import { Popup } from 'maplibre-gl'
import PosterPopup from 'src/map/popup/layerPopups/PosterPopup.vue'

export default defineComponent({
  name: 'PosterOverviewMap',
  components: { PosterPopup, PosterMarkerLayer, Geocoder },
  setup() {
    const map = useMap()
    const clickedPoster = ref<PosterDto | null>(null)
    let bounds = ref(userStore.getState().bbox)
    const popup = ref<Popup | null>(null)
    const popupElement = ref<HTMLElement | null>(null)
    const updateBounds = () => {
      bounds.value = map.value?.getBounds().toArray().flat() as BBox2d
    }
    map.value.on('zoomend', updateBounds)
    map.value.on('moveend', updateBounds)
    onUnmounted(() => {
      map.value.off('zoomend', updateBounds)
      map.value.off('moveend', updateBounds)
      popup?.value?.remove()
    })
    updateBounds()
    const {
      filterParams,
      itemHoveredOver: posterHoveredOver,
      items: posters,
      updateFilterParams
    } = useOverviewMixin<PosterDto, PosterFilterParams>(
      posterOverviewStore,
      apiClient.posters
    )
    return {
      clickedPoster,
      filterParams,
      posterHoveredOver,
      posters,
      updateFilterParams,
      bounds,
      map,
      popup,
      popupElement
    }
  },
  computed: {},
  methods: {
    async updateWithinFilter(polygon: BBox2d) {
      await this.updateFilterParams({
        within: bboxPolygon(polygon).geometry
      })
    },
    handlePosterClick(poster: PosterDto) {
      // @ts-ignore
      this.$refs.posterPopup.showPopup(poster)
    }
  },
  async created() {
    await this.updateWithinFilter(this.bounds as BBox2d)
  },
  watch: {
    bounds: async function (newBound) {
      await this.updateWithinFilter(newBound)
    }
  }
})
</script>
