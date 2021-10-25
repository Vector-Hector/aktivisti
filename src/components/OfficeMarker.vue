<template>
  <Marker
    :location="location"
  >
    <template v-slot:marker>
      <QIcon
        :name="icon"
        class="clickable-marker"
        size="lg"
      />
    </template>
    <slot />
  </Marker>
</template>

<script lang="ts">


import { defineComponent, PropType } from 'vue'
import { LocationDto } from 'src/api/model/LocationDto'
import Marker from 'src/mapbox/Marker.vue'
import { QIcon } from 'quasar'

export default defineComponent({
  components: {Marker, QIcon},
  props: {
    location: {
      type: Object as PropType<LocationDto>,
      required: true
    },
    isGrayedOut: {
      type: Boolean as PropType<boolean>,
      default: false
    }
  },
  computed: {
    icon(): string {
      if (this.isGrayedOut) {
        return 'img:static/icons/map-pin-office-grayed-out.svg'
      }
      return 'img:static/icons/map-pin-office.svg'
    }
  }
})
</script>
<style lang="scss" scoped>
.clickable-marker {
  cursor: pointer;
}
</style>
