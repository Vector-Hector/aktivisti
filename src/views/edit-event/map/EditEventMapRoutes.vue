<template>
  <DrawControl />
  <Marker
    :location="event.location.center"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import DrawControl from '@/lib/mapbox/DrawControl.vue'
import Marker from '@/lib/mapbox/Marker.vue'
import EditEventMixin from '@/views/edit-event/EditEventMixin'



export default defineComponent({
  name: 'EditEventMapRoutes',
  components: {
    Marker,
    DrawControl
  },
  mixins: [EditEventMixin],
  data() {
    return {}
  },

})
</script>

<style lang="scss" scoped>
</style>
