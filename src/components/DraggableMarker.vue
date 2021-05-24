<template>
  <i
    class="marker-icon"
    :class="{
      'is-dragging': dragging
    }"
    draggable="true"
    @dragstart="onDragStart"
  />
</template>
<script lang="ts">

import { defineComponent } from 'vue'
import { MapEventBus } from 'src/mapbox/Map.vue'
import { uuidv4 } from 'src/utils/uuid'
import { LocationDto } from 'src/api/model/LocationDto'

export default defineComponent({
  name: 'DraggableMarker',
  emits: ['dropped'],
  data() {
    return {
      id: uuidv4(),
      dragging: false
    }
  },
  created() {
    MapEventBus.on('drop', (event: {originalEvent: any, coordinates: LocationDto}) => {
      if (event.originalEvent.dataTransfer.getData('id') === this.id) {
        this.$emit('dropped', event)
      }
    })
  },
  methods: {
    onDragStart(event: any) {
      event.dataTransfer.setData('id', this.id)
      event.dataTransfer.dropEffect = 'move'
      event.dataTransfer.effectAllowed = 'move'
    }
  }
})
</script>
<style lang="scss">
.dragging {
  position: fixed;
}
</style>
