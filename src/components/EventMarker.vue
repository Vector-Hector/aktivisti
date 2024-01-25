<script setup lang="ts">
import Marker from '../map/Marker.vue'
import { computed } from 'vue'
import { EventDto } from '../api/model/EventDto'
import { EventTypes } from '../api/model/EventTypes'
import { QIcon } from 'quasar'

interface Props {
  event: EventDto
}
const props = defineProps<Props>()

const icon = computed(() => {
  switch (props.event.event_type) {
    case EventTypes.POSTERS:
      return 'img:/static/icons/map-pin-poster.svg'
    case EventTypes.DOOR_TO_DOOR:
      return 'img:/static/icons/map-pin-door.svg'
    case EventTypes.FLYERS:
      return 'img:/static/icons/map-pin-flyer.svg'
    default:
      return 'img:/static/icons/map-pin-generic.svg'
  }
})
</script>

<template>
  <Marker :location="event.location">
    <template v-slot:marker>
      <QIcon :name="icon" class="clickable-marker" size="lg" />
    </template>
    <slot />
  </Marker>
</template>
