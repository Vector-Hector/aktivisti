<template>
  <div class="page">
    <div class="edit-event">
      <Steps
        :model="steps"
        :readonly="false"
      />
      <router-view
        v-slot="{Component}"
        v-model:event="event"
        :campaigns="campaigns"
      >
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

import { EventTypes } from '@/api/model/EventTypes'
import { EventDto } from '@/api/model/EventDto'
import Steps from 'primevue/steps'
import { RouteParams } from 'vue-router'
import { apiClient } from '@/api/ApiClient'
import { CampaignDto } from '@/api/model/CampaignDto'
import { uiStore } from '@/store/UiStore'

/**
 * The parent component implementing the individual steps for creating an event
 */
export default defineComponent({
  name: 'EditEvent',
  components: {
    Steps
  },
  beforeRouteEnter: async (to, from, next) => {
    const campaignRequest = await apiClient.campaigns.list()
    if (to.params.id) {
      const eventRequest = await apiClient.events.get(to.params.id as string, ['metrics'])
      next((vm: any) => {
        uiStore.updateActiveElements({
          event: eventRequest.payload.data.name
        })
        vm.event = eventRequest.payload.data
        vm.campaigns = campaignRequest.payload.data
        vm.metricRecords = eventRequest.payload.embedded.metrics
      })
    } else {
      next((vm: any) => {
        vm.campaigns = campaignRequest.payload.data
      })
    }
  },
  props: {
    // event id
    id: {
      type: String as PropType<string | null>,
      required: false,
      default: null
    }
  },
  data() {
    return {
      campaigns: [] as CampaignDto[],
      event: {
        event_type: EventTypes.DOOR_TO_DOOR,
        metrics: [],
        targets: {}
      } as Partial<EventDto>
    }
  },
  computed: {
    steps(): any[] {
      return [{
        label: 'Beschreibung',
        to: this.$router.resolve({
          name: this.id !== null ? 'edit-event-details' : 'edit-event-details-new',
          params: {
            id: this.id?.toString() ?? ''
          }
        }).path
      }, {
        label: 'Treffpunkt',
        to: this.resolveIfEventId({
          name: 'edit-event-location'
        }),
        disabled: !this.event.id
      }, {
        label: 'Gebiete',
        to: this.resolveIfEventId({
          name: 'edit-event-routes',
        }),
        disabled: !this.event.location || !this.event.id
      }]
    }
  },
  methods: {
    /**
     * This function will resolve the edit event sub routes if an event id is available (meaning it has been created
     * in the backend), otherwise the steps should be disabled and this function will return '' (undefined is not allowed
     * as a routing target)
     * @param location route parameters of the target route, (event-)id will be auto-filled by this function
     */
    resolveIfEventId(location: { name: string, params?: RouteParams }): string {
      if (this.id) {
        return this.$router.resolve({
          ...location,
          params: {
            ...location.params,
            id: this.id ?? undefined
          },
        })?.path
      } else {
        return ''
      }
    }
  }
})
</script>

<style lang="scss" scoped>

.edit-event {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: auto;
}
</style>
