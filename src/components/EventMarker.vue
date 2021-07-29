<template>
  <Marker
    :location="event.location"
  >
    <template v-slot:marker>
      <QIcon
        :name="icon"
        size="xl"
      />
    </template>
    <slot />
  </Marker>
</template>
<script lang="ts">
import Marker from '../mapbox/Marker.vue'
import { defineComponent, PropType } from 'vue'
import { EventDto } from '../api/model/EventDto'
import { EventTypes } from '../api/model/EventTypes'
import { QIcon } from 'quasar'

export default defineComponent({
  components: {Marker, QIcon},
  props: {
    event: {
      type: Object as PropType<EventDto>,
      required: true
    }
  },
  computed: {
    icon(): string {
      switch (this.event.event_type) {
      case EventTypes.POSTERS:
        return 'img:static/icons/map-pin-poster.svg'
      case EventTypes.DOOR_TO_DOOR:
        return 'img:static/icons/map-pin-door.svg'
      default:
        return 'img:static/icons/map-pin-generic.svg'
      }
    }
  }
})
</script>
<style lang="scss" scoped>

</style>
