<template>
  <PosterMarkerLayer
    v-model:posters="posters"
    :active-poster-index="activePosterIndex"
    :editable="true"
    @posterClick="({ id }) => goToPoster(id)"
  />
  <AreaFeatureLayer :features="features" />
  <router-view name="map" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useEditPosterListMixin } from 'pages/edit-event/posters/EditPosterListMixin'
import PosterMarkerLayer from 'src/map/PosterMarkerLayer'
import { useEditEventGeometryMixin } from 'pages/edit-event/geometry/EditEventGeometryMixin'
import AreaFeatureLayer from 'src/map/AreaFeatureLayer'
import { useEditEventMixin } from 'pages/edit-event/EditEventMixin'

export default defineComponent({
  name: 'EditEventPostersMap',
  setup() {
    const { eventAreas } = useEditEventMixin()
    const { features } = useEditEventGeometryMixin()
    const { posters, activePosterIndex } = useEditPosterListMixin()
    return { eventAreas, features, posters, activePosterIndex }
  },
  components: {
    PosterMarkerLayer,
    AreaFeatureLayer
  },
  methods: {
    goToPoster(posterId: number) {
      void this.$router.push({
        name: 'edit-event-single-poster-edit',
        params: { posterId: posterId }
      })
    }
  }
})
</script>

<style lang="scss" scoped></style>
