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
import { defineComponent, PropType } from 'vue'

import { EventTypes } from '@/api/model/EventTypes'
import { EventDto } from '@/api/model/EventDto'
import Steps from 'primevue/components/steps/Steps'
import { RouteParams } from 'vue-router'
import { ApiClient } from '@/api'

const apiClient = new ApiClient()

export default defineComponent({
  name: 'EditEvent',
  components: {
    Steps
  },
  beforeRouteEnter: async (to, from, next) => {
    if (to.params.id) {
      // TODO this.$apiClient doesn't work here
      const response = await apiClient.events.get(to.params.id as string)
      next((vm: any) => {
        vm.event = response.payload.data
      })
    } else {
      next()
    }
  },
  props: {
    id: {
      type: String as PropType<string | null>,
      required: false,
      default: null
    }
  },
  data() {
    return {
      event: {
        type: EventTypes.DOOR_TO_DOOR,
        metrics: [],
        targets: {}
      } as Partial<EventDto>
    }
  },
  computed: {
    steps(): any[] {
      return [{
        label: 'Allgemein',
        to: this.$router.resolve({
          name: this.id !== null ? 'edit-event-details' : 'edit-event-details-new',
          params: {
            id: this.id?.toString() ?? ''
          }
        }).path
      }, {
        label: 'Ort',
        to: this.resolveIfEventId({
          name: 'edit-event-location'
        }),
        disabled: !this.event.id
      }, {
        label: 'Abschnitte',
        to: this.resolveIfEventId({
          name: 'edit-event-routes'
        }),
        disabled: !this.event.location || !this.event.id
      }, {
        label: 'Zusammenfassung',
        to: this.resolveIfEventId({
          name: 'edit-event-summary'
        }),
        disabled: !this.event.location || !this.event.id
      }]
    }
  },
  methods: {
    async getEvent() {
      this.event = (await this.$apiClient.events.get(this.id!)).payload.data
    },
    setEvent(event: EventDto) {
      this.event = event
    },
    resolveIfEventId(location: { name: string, params?: RouteParams }): string | undefined {
      if (this.id) {
        return this.$router.resolve({
          ...location,
          params: {
            ...location.params,
            id: this.id ?? undefined
          }
        })?.path
      } else {
        return undefined
      }
    }
  }
})
</script>

<style lang="scss" scoped>

</style>
