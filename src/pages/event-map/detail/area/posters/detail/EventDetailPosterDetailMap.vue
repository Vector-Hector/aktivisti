<template>
  <span />
</template>
<script lang="ts">
import { useEventDetailPosterMixin } from 'pages/event-map/detail/area/posters/EventDetailPosterMixin'
import { defineComponent, inject } from 'vue'
import { MapInject } from 'src/map/Map.vue'

export default defineComponent({
  name: 'EventDetailPosterDetailMap',
  setup() {
    const { poster } = useEventDetailPosterMixin()
    const map = inject(MapInject)!
    return { map, poster }
  },
  created() {
    this.map?.panTo(this.poster.location)
  },
  updated() {
    this.map?.panTo(this.poster.location)
  }
})
</script>
<style></style>
