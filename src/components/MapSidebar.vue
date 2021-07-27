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
import { computed, defineComponent, PropType } from 'vue'

export default defineComponent({
  name: 'MapSidebar',
  props: {
    title: {
      type: String as PropType<string>,
      required: false
    }
  },
  provide() {
    return {
      scrollArea: computed(() => this.$refs.scrollArea)
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
  overflow: hidden;
  height: 100%;
}

.map-sidebar-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
</style>
