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
import { defineComponent, PropType } from 'vue'

export default defineComponent({
  name: 'MapSidebar',
  props: {
    title: {
      type: String as PropType<string>,
      required: false
    }
  }
})
</script>
<style lang="scss" scoped>
.map-sidebar {
  min-width: 450px;
  width: 25vw;
  order: 0;
  display: flex;
  flex-direction: column;
}
.map-sidebar-content {
  display: flex;
  flex: 1;
  flex-direction: column;
}
</style>
