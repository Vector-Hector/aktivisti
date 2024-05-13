<script setup lang="ts">
import { useEditPosterListMixin } from 'pages/edit-event/posters/EditPosterListMixin'
import PosterMarkerLayer from 'src/map/PosterMarkerLayer.vue'
import { useEditEventGeometryMixin } from 'pages/edit-event/geometry/EditEventGeometryMixin'
import AreaFeatureLayer from 'src/map/AreaFeatureLayer.vue'
import { useRouter } from 'vue-router'

const $router = useRouter()

const { features } = useEditEventGeometryMixin()
const { posters, activePosterIndex } = useEditPosterListMixin()

function goToPoster(posterId: number) {
  void $router.push({
    name: 'edit-event-single-poster-edit',
    params: { posterId: posterId }
  })
}
</script>
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

<style lang="scss" scoped></style>
