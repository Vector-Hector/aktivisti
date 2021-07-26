<template>
  <span />
</template>
<script lang="ts">
import EventDetailPosterMixin from 'pages/event-map/detail/area/posters/EventDetailPosterMixin'
import { defineComponent, inject } from 'vue'
import { MapInject } from 'src/mapbox/Map.vue'

export default defineComponent({
  name: 'EventDetailPosterDetailMap',
  mixins: [EventDetailPosterMixin],
  setup() {
    const map = inject(MapInject)!
    return {map}
  },
  created() {
    this.map?.panTo(this.poster.location)
  },
  updated() {
    this.map?.panTo(this.poster.location)
  }
})
</script>
<style>

</style>
