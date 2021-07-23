<template>
  <PosterTable
    :posters="postersInArea"
    :show-actions="false"
    @row-click="selectPoster($event.id)"
  />
</template>
<script lang="ts">
import PosterTable from 'components/PosterTable.vue'
import EventDetailPosterMixin from 'pages/event-map/detail/area/posters/EventDetailPosterMixin'
import { defineComponent } from 'vue'
import EventDetailStoreMixin from 'pages/event-map/detail/EventDetailStoreMixin'

export default defineComponent({
  name: 'EventDetailPosterList',
  components: {PosterTable},
  mixins: [EventDetailPosterMixin, EventDetailStoreMixin],
})
</script>
<style lang="scss" scoped>

</style>
