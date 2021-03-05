<template>
  <Map
    :center="location"
    :zoom="zoom"
  >
    <router-view
      v-model:event="localEvent"
      :campaigns="campaigns"
    />
  </Map>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Map from '@/lib/mapbox/Map.vue'
import EditEventMixin from '@/views/edit-event/EditEventMixin'
import { LocationDto } from '@/api/model/LocationDto'


export default defineComponent({
  name: 'EditEventMap',
  components: {
    Map
  },
  mixins: [EditEventMixin],
  computed: {
    zoom() {
      if (this.event.location?.center) {
        return 14
      } else {
        return 11
      }
    },
    location(): LocationDto {
      return this.event.location?.center ?? {
        lat: 51.1642292,
        lng: 10.4541194
      }
    }
  }
})
</script>

<style lang="scss" scoped>
</style>
