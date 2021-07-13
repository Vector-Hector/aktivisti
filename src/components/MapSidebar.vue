<template>
  <div class="map-sidebar">
    <h3
      v-if="title"
      class="overlay-title"
    >
      {{ title }}
    </h3>
    <div class="map-sidebar-content">
      <QScrollArea
        ref="scrollArea"
        class="scrollable-content"
      >
        <slot />
      </QScrollArea>
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { QScrollArea } from 'quasar'

export default defineComponent({
  name: 'MapSidebar',
  components: {
    QScrollArea
  },
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
}

.map-sidebar-content {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.scrollable-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

:deep(.q-scrollarea__content) {
  display: flex;
  flex-direction: column;
}
</style>
