<template>
  <div
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
        'bottom': this.$q.screen.lt.md,
        'side': !this.$q.screen.lt.md
      }
    }
  }
})
</script>
<style lang="scss" scoped>
.map-container {
  position: relative;
  display: flex;
  height: 100%;

  &.side {
    flex-direction: row;
  }

  &.bottom {
    flex-direction: column;
  }
}


</style>
