<template>
  <span>{{ event.name }}</span>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { EventDto } from 'src/api/model/EventDto'


export default defineComponent({
  name: 'DoorToDoorPrintout',
  props: {
    event: {
      type: Object as PropType<EventDto>,
      required: true
    }
  }
})
</script>

<style lang="scss" scoped>

</style>
