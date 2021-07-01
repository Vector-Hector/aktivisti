<template>
  <EventPrintout v-if="event" :event="event" />
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { EventDto } from 'src/api/model/EventDto'
import { apiClient } from 'src/api/ApiClient'
import EventPrintout from 'components/print/EventPrintout.vue'

export default defineComponent({
  name: 'PrintEvent',
  props: {
    eventId: {
      type: String as PropType<string>,
      required: true
    }
  },
  async beforeRouteEnter(to, from, next) {
    const eventRequest = await apiClient.events.get(to.params.eventId.toString())
    next((vm) => {
      // @ts-ignore
      vm.event = eventRequest.payload.data
    })
  },
  components: {
    EventPrintout
  },
  data() {
    return {
      event: null as EventDto | null
    }
  }
})
</script>
