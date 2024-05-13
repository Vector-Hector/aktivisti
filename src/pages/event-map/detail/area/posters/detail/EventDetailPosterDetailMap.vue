<script setup lang="ts">
import { useEventDetailPosterMixin } from 'pages/event-map/detail/area/posters/EventDetailPosterMixin'
import { inject, onMounted, onUpdated } from 'vue'
import { MapKey } from 'src/types/keys'

const { poster } = useEventDetailPosterMixin()
const map = inject(MapKey)!

onMounted(() => {
  map.value?.panTo(poster.value.location)
})

onUpdated(() => {
  map.value?.panTo(poster.value.location)
})
</script>
<template>
  <span />
</template>
<style></style>
