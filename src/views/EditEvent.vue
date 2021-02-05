<template>
  <Steps
    :model="steps"
    :readonly="false"
  />
  <router-view
    v-slot="{Component}"
    v-model:event="event"
  >
    <keep-alive>
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { EventTypes } from '@/api/model/EventTypes'
import { EventDto } from '@/api/model/EventDto'
import Steps from 'primevue/components/steps/Steps'


export default defineComponent({
  name: 'EditEvent',
  components: {
    Steps
  },
  data() {
    return {
      event: {
        type: EventTypes.DOOR_TO_DOOR,
        selectedMetrics: [],
        targets: {}
      } as Partial<EventDto>
    }
  },
  computed: {
    steps(): any[] {
      return [{
        label: 'Allgemein',
        to: this.$router.resolve({
          name: 'edit-event-details'
        }).path
      }, {
        label: 'Ort',
        to: this.$router.resolve({
          name: 'edit-event-location'
        }).path
      }, {
        label: 'Abschnitte',
        to: this.$router.resolve({
          name: 'edit-event-routes'
        }).path,
        disabled: !this.event.location
      }, {
        label: 'Zusammenfassung',
        to: this.$router.resolve({
          name: 'edit-event-summary'
        }).path,
        disabled: !this.event.location
      }]
    }
  },
  created() {
  },
  methods: {}
})
</script>

<style lang="scss" scoped>

</style>
