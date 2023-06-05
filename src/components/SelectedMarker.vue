<template>
  <Marker :location="location">
    <template v-slot:marker>
      <QIcon
        name="img:static/icons/map-pin-selected.svg"
        class="clickable-marker"
        size="xl"
      />
    </template>
  </Marker>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue'
import Marker from 'src/map/Marker.vue'
import { QIcon } from 'quasar'
import { LocationDto } from 'src/api/model/LocationDto'

export default defineComponent({
  name: 'SelectedMarker',
  components: { Marker, QIcon },
  props: {
    location: {
      type: Object as PropType<LocationDto>,
      required: true
    }
  }
})
</script>
