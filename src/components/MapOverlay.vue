<template>
  <div
    :class="`map-overlay ${position}`"
  >
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'


export default defineComponent({
  name: 'MapOverlay',
  props: {
    position: {
      type: String as PropType<'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'>,
      default: 'top-left'
    }
  }
})
</script>

<style lang="scss" scoped>
@import 'src/scss/_globals.scss';

.top-right {
  top: 0;
  right: 0;
}

.top-left {
  top: 0;
  left: 0;
}

.bottom-right {
  bottom: 0;
  right: 0;
}

.bottom-left {
  bottom: 0;
  left: 0;
}

</style>
