<template>
  <div
    class="map-container"
    :class="containerClasses"
  >
    <slot />
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'MapContainer',
  computed: {
    containerClasses() {
      return {
        'map-container': true,
        'bottom': this.$q.screen.lt.lg,
        'side': !this.$q.screen.lt.lg
      }
    }
  }
})
</script>
<style lang="scss" scoped>
.map-container {
  position: relative;
  display: flex;
  flex: 1;

  &.side {
    flex-direction: row;
  }

  &.bottom {
    flex-direction: column;
  }
}


</style>
