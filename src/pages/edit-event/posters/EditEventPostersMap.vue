<template>
  <PosterMarkerLayer
    v-model:posters="posters"
    :active-poster-index="activePosterIndex"
    :editable="true"
    :opacity="posterOpacity"
    @posterClick="goToPoster"
  />
  <AreaFeatureLayer
    :features="features"
  />
  <router-view name="map" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import EditPosterListMixin from 'pages/edit-event/posters/EditPosterListMixin'
import PosterMarkerLayer from 'src/mapbox/PosterMarkerLayer'
import EditEventGeometryMixin from 'pages/edit-event/geometry/EditEventGeometryMixin'
import AreaFeatureLayer from 'src/mapbox/AreaFeatureLayer'

export default defineComponent({
  name: 'EditEventPostersMap',
  mixins: [EditPosterListMixin, EditEventGeometryMixin],
  components: {
    PosterMarkerLayer,
    AreaFeatureLayer
  },
  computed: {
    posterOpacity(): number {
      if (['edit-event-single-poster-edit', 'edit-event-single-poster-new'].includes(
        this.$route.name?.toString() ?? '')
      ) {
        return 0.5
      } else {
        return 1
      }
    }
  },
  methods: {
    goToPoster(posterId: number) {
      void this.$router.push({
        name: 'edit-event-single-poster-edit',
        params: {posterId: posterId}
      })
    }
  }
})
</script>

<style lang="scss" scoped>

</style>
