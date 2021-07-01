<template>
  <DoorToDoorPrintout :event="event" v-if="event.event_type === EventTypes.DOOR_TO_DOOR" />
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { EventDto } from 'src/api/model/EventDto'
import DoorToDoorPrintout from 'components/print/DoorToDoorPrintout.vue'
import { EventTypes } from 'src/api/model/EventTypes'


export default defineComponent({
  name: 'EventPrintout',
  components: {DoorToDoorPrintout},
  props: {
    event: {
      type: Object as PropType<EventDto>
    }
  },
  data() {
    return {
      EventTypes
    }
  }
})
</script>

<style lang="scss" scoped>

</style>
