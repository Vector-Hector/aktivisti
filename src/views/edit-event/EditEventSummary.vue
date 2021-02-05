<template>
  <div>
    <div>{{ event.title }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { EventDto } from '@/api/model/EventDto'


export default defineComponent({
  name: 'EditEventSummary',
  components: {},
  props: {
    event: {
      type: Object as PropType<Partial<EventDto>>,
      required: true
    }
  },
  data() {
    return {}
  }
})
</script>

<style lang="scss" scoped>
</style>
