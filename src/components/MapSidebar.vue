<template>
  <div class="map-sidebar">

    <h3
      v-if="title"
      class="overlay-title"
    >
      {{ title }}
    </h3>
    <div class="map-sidebar-content">
      <slot />
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'MapSidebar'
})
</script>
<style lang="scss" scoped>
.map-sidebar {
  min-width: 400px;
  width: 20vw;
  order: 0
}
</style>
