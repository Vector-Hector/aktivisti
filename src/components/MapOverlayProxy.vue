<template>
  <component class="overlay-shadow" :is="overlayComponent" v-bind="$props">
    <slot />
  </component>
</template>

<script lang="ts">
import { defineComponent, PropType, Component } from 'vue'
import ResizableBottomSheet from 'components/ResizableBottomSheet.vue'
import MapSidebar from 'components/MapSidebar.vue'


export default defineComponent({
  name: 'MapOverlayProxy',
  components: {
    MapSidebar,
    ResizableBottomSheet
  },
  props: {
    title: {
      type: String as PropType<string>,
      required: false,
      default: undefined
    }
  },
  computed: {
    overlayComponent(): Component {
      return this.$q.screen.lt.lg ? ResizableBottomSheet : MapSidebar
    }
  }
})
</script>

<style lang="scss" scoped>
::v-deep(.overlay-title) {
  background: $gray-100;
  border-bottom: 1px solid $red;
  margin: 0;
  padding: 0.5rem 1rem;
  font-size: 1.5rem;
  line-height: 1.5rem;
}
</style>
