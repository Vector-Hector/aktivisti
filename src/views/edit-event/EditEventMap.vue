<template>
  <Map :center="{ lng: 53, lat: 11 }">
    <router-view
      v-model:event="localEvent"
    />
  </Map>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Map from '@/lib/mapbox/Map.vue'
import EditEventMixin from '@/views/edit-event/EditEventMixin'


export default defineComponent({
  name: 'EditEventMap',
  components: {
    Map
  },
  mixins: [EditEventMixin]
})
</script>

<style lang="scss" scoped>
</style>
