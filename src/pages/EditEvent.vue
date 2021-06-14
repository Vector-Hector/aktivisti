<template>
  <QPage class="edit-event">
    <QStepper class="stepper"
      alternative-labels
      v-model="step"
      color="primary"
      animated
    >
      <QStep
        :name="1"
        title="Beschreibung"
        prefix="1"
       />
      <QStep
        :name="2"
        title="Treffpunkt"
        prefix="2"
      />
      <QStep
        :name="3"
        title="Gebiete"
        prefix="3"
      />
    </QStepper >
    <router-view
      v-slot="{Component}"
      v-model:event="event"
      v-model:event-metric-records="metricRecords"
      :campaigns="campaigns"
    >
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </QPage>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

import { EventTypes } from 'src/api/model/EventTypes'
import { EventDto, VisibilityOptions } from 'src/api/model/EventDto'
import { apiClient } from 'src/api/ApiClient'
import { CampaignDto } from 'src/api/model/CampaignDto'
import { uiStore } from 'src/store/UiStore'
import { EventMetricRecordDto } from 'src/api/model/EventMetricRecordDto'
import { QStep, QStepper, QPage, QPopupProxy } from 'quasar'

/**
 * The parent component implementing the individual steps for creating an event
 */
export default defineComponent({
  name: 'EditEvent',
  components: {
    QStep,
    QStepper,
    QPage,
    QPopupProxy
  },
  beforeRouteEnter: async (to, from, next) => {
    const campaignRequestPromise = apiClient.campaigns.list()
    if (to.params.id) {
      const [eventRequest, campaignRequest] = await Promise.all([
        apiClient.events.get(to.params.id as string, ['eventmetricrecord_set']),
        campaignRequestPromise
      ])
      next((vm: any) => {
        uiStore.updateActiveElements({
          event: eventRequest.payload.data.name
        })
        vm.event = eventRequest.payload.data
        vm.campaigns = campaignRequest.payload.data
        vm.metricRecords = eventRequest.payload.embedded.eventmetricrecord_set
      })
    } else {
      const campaignRequest = await campaignRequestPromise
      next((vm: any) => {
        vm.campaigns = campaignRequest.payload.data
      })
    }
  },
  beforeRouteUpdate() {
    uiStore.updateActiveElements({
      event: this.event.name
    })
  },
  props: {
    // event id
    id: {
      type: String as PropType<string | null>,
      required: false,
      default: null
    }
  },
  created() {
    this.setStep(this.$route.name)
  },
  data() {
    return {
      campaigns: [] as CampaignDto[],
      metricRecords: [] as EventMetricRecordDto[],
      event: {
        event_type: EventTypes.DOOR_TO_DOOR,
        metrics: [],
        targets: {},
        visibility: VisibilityOptions.Public
      } as Partial<EventDto>,
      step: 1 as number
    }
  },
  watch: {
    '$route' (to) {
      this.setStep(to.name)
    }
  },
  methods: {
    setStep(locationName: any): void {
      switch(locationName){
        case 'edit-event-location':
          this.step = 2
          break;
        case 'edit-event-routes':
          this.step = 3
          break;
        default:
          this.step = 1
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
  width: 100%;
  // TODO(peter@ctrl.alt.coop): Don't show/render the html element instead of hiding it.
  ::v-deep .q-stepper__step-inner{
    display:none
  }
}

</style>
