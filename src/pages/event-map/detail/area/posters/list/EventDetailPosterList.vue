<template>
  <PosterTable
    :posters="posters"
    :show-actions="false"
    @row-click="selectPoster($event.id)"
  />
</template>
<script lang="ts">
import PosterTable from 'components/PosterTable.vue'
import EventDetailPosterMixin from 'pages/event-map/detail/area/posters/EventDetailPosterMixin'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'EventDetailPosterList',
  components: {PosterTable},
  mixins: [EventDetailPosterMixin],
})
</script>
<style lang="scss" scoped>

</style>
