<script setup lang="ts">
import { computed } from 'vue'
import ResizableBottomSheet from 'components/ResizableBottomSheet.vue'
import MapSidebar from 'components/MapSidebar.vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const overlayComponent = computed(() => {
  return $q.screen.lt.md ? ResizableBottomSheet : MapSidebar
})
</script>

<template>
  <component class="overlay-shadow" :is="overlayComponent" v-bind="$props">
    <slot />
  </component>
</template>

<style lang="scss" scoped>
::v-deep(.overlay-title) {
  background: $grey-1;
  border-bottom: 1px solid $red;
  margin: 0;
  padding: 0.5rem 1rem;
  font-size: 1.5rem;
  line-height: 1.5rem;
}
</style>
