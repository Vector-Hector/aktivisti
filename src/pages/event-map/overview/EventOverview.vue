<template>
  <div class="container event-overview">
    <CollapsibleFilters
      class="collapsible-filters"
      :activated-filter-count="activatedFilterCount"
    >
      <div class="filter-content">
        <EventFilterList
          v-model:filter-params="userFilterParams"
          :campaigns="campaigns"
          :sub-associations="subAssociations"
        />
      </div>
    </CollapsibleFilters>
    <EventList
      v-if="eventsPagination && events"
      v-model:events="events"
      v-model:pagination="eventsPagination"
      :filter-params="filterParams"
      :campaigns="campaigns"
      class="event-list"
      ref="eventList"
      @clickOnEvent="goToEvent"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { CampaignDto } from 'src/api/model/CampaignDto'
import { userStore } from 'src/store/UserStore'
import { isEqual } from 'lodash-es'
import { showCampaignLevel } from 'src/utils/showCampaignLevel'
import CollapsibleFilters from 'src/components/CollapsibleFilters.vue'
import { SubAssociationDto } from 'src/api/model/SubAssociationDto'
import EventList from 'src/components/EventList.vue'
import { Pagination } from 'src/api/model/APIEnvelope'
import { ionChevronDown, ionClose } from '@quasar/extras/ionicons-v5'
import EventsOverviewMixin from 'pages/event-map/overview/EventsOverviewMixin'
import { EVENT_LIST_CHUNK_SIZE } from 'src/constants'
import EventFilterList from 'components/EventFilterList.vue'
import { EventFilterParams } from 'src/api/params/EventFilterParams'
import { EventStatus } from 'src/api/model/EventStatus'
import { EventDto } from 'src/api/model/EventDto'


export default defineComponent({
  name: 'EventOverview',
  mixins: [EventsOverviewMixin],
  components: {
    EventFilterList,
    EventList,
    CollapsibleFilters
  },
  beforeRouteEnter(to, from, next) {
    if (userStore.getState().bbox === null) {
      next({name: 'splash'})
    } else {
      next()
    }
  },
  data() {
    return {
      eventsPagination: null as Pagination | null,
      campaigns: [] as CampaignDto[],
      subAssociations: [] as SubAssociationDto[],
      ionChevronDown,
      ionClose
    }
  },
  computed: {
    userFilterParams: {
      get(): EventFilterParams {
        const {campaign, subAssociations, sorting, eventType, status} = userStore.getState().filterPreferences
        return {
          sub_association: subAssociations,
          campaigns: campaign !== undefined ? [campaign] : undefined,
          order_by: sorting,
          event_type: eventType,
          status: status ?? EventStatus.ACTIVE
        }
      },
      set(value: EventFilterParams) {
        userStore.setFilterPreferences({
          ...userStore.getState().filterPreferences,
          ...{
            subAssociations: value.sub_association ?? [],
            campaign: value.campaigns?.[0],
            sorting: value.order_by!,
            eventType: value.event_type ?? undefined,
            status: value.status ?? undefined
          }
        })
      }
    },
    activatedFilterCount(): number {
      let active = 0
      if ((this.userFilterParams.sub_association?.length ?? 0) > 0) {
        active++
      }
      if (this.userFilterParams.campaigns) {
        active++
      }
      if (this.userFilterParams.status === EventStatus.ENDED){
        active++
      }
      if(this.userFilterParams.event_type){
        active++
      }
      return active
    },
    filterParams(): EventFilterParams {
      return {
        ...this.userFilterParams,
        within: this.boundingBoxJson ?? undefined,

        limit: EVENT_LIST_CHUNK_SIZE,
        end_date_include_null: true
      }
    }
  },
  watch: {
    filterParams: {
      handler(newValue, oldValue) {
        if (isEqual(newValue, oldValue)) return
        void this.updateView()
      },
      deep: true,
      immediate: true
    }
  },
  async created() {
    await this.getCampaigns()
    await this.getSubAssociations()
  },
  methods: {
    showCampaignLevel,
    async getSubAssociations() {
      this.subAssociations = (await this.$apiClient.subAssociations.list()).payload.data
    },
    async updateView() {
      if (this.$refs.eventList){
        // @ts-ignore
        this.$refs.eventList.resetScrollPosition()
      }
      if (this.filterParams.within) {
        const clusterResponse = await this.$apiClient.eventClusters.list(this.filterParams)
        if (!isEqual(this.clusters, clusterResponse.payload.data)) {
          this.clusters = clusterResponse.payload.data
        }
        const eventsResponse = await this.$apiClient.events.list(this.filterParams)
        if (!isEqual(this.events, eventsResponse.payload.data))
          this.events = eventsResponse.payload.data
        this.eventsPagination = eventsResponse.payload.pagination!
      }
    },
    async getCampaigns() {
      const response = await this.$apiClient.campaigns.list()
      this.campaigns = response.payload.data
    },
    goToEvent(event: EventDto) {
      void this.$router.push({
        name: 'event-detail',
        params: {
          eventId: event.id
        }
      })
    },
  }
})
</script>
<style lang="scss" scoped>

.event-overview {
  height: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 1rem;
}

.filter-content {
  padding: 1rem;
}

.select-wrapper {
  &:not(:last-of-type) {
    margin: 0 0 1rem 0;
  }
}

.event-list {
  margin: 1rem 0;
  height: 100%;
  overflow: hidden;
}
</style>
