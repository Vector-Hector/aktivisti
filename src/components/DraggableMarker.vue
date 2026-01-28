<script setup lang="ts">
import { ref } from 'vue'
import { uuidv4 } from 'src/utils/uuid'
import { LocationDto } from 'src/api/model/LocationDto'
import { QIcon } from 'quasar'
import { MapEventBus } from 'src/map/MapUtils'

interface Emits {
  (
    e: 'dropped',
    event: {
      originalEvent: any
      coordinates: LocationDto
    }
  ): void
}

const emit = defineEmits<Emits>()

const id = uuidv4()
const dragging = ref(false)

MapEventBus.on(
  'drop',
  (event: { originalEvent: any; coordinates: LocationDto }) => {
    if (event.originalEvent.dataTransfer.getData('id') === id) {
      emit('dropped', event)
    }
  }
)

function onDragStart(event: any) {
  event.dataTransfer.setData('id', id)
  event.dataTransfer.dropEffect = 'move'
  event.dataTransfer.effectAllowed = 'move'
}
</script>

<template>
  <QIcon
    :class="{
      'is-dragging': dragging
    }"
    name="img:static/icons/location-select.svg"
    draggable="true"
    @dragstart="onDragStart"
  />
</template>

<style lang="scss" scoped>
.dragging {
  position: fixed;
}
</style>
