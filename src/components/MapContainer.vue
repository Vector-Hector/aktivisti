<script setup lang="ts">
import { useQuasar } from 'quasar'
import { computed } from 'vue'

const $q = useQuasar()
const containerClasses = computed(() => {
  return {
    'map-container': true,
    bottom: $q.screen.lt.md,
    side: $q.screen.lt.md
  }
})
</script>
<template>
  <div :class="containerClasses">
    <slot />
  </div>
</template>
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
