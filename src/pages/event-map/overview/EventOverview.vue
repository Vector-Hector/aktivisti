<template>
  <div class="container">
    <CollapsibleFilters
      class="collapsible-filters"
      :activated-filter-count="activatedFilterCount"
    >
      <div class="filter-content">
        <EventFilter
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
import { EVENT_MAP_MAX_EVENTS } from 'src/constants'
import EventFilter, { UserEventFilterParams } from 'components/EventFilter.vue'


export default defineComponent({
  name: 'EventMap',
  mixins: [EventsOverviewMixin],
  components: {
    EventFilter,
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
      get(): UserEventFilterParams {
        const {campaign, subAssociations, sorting} = userStore.getState().filterPreferences
        return {
          sub_association: subAssociations,
          campaigns: campaign !== undefined ? [campaign] : undefined,
          order_by: sorting
        }
      },
      set(value: UserEventFilterParams) {
        userStore.setFilterPreferences({
          ...userStore.getState().filterPreferences,
          ...{
            subAssociations: value.sub_association ?? [],
            campaign: value.campaigns?.[0],
            sorting: value.order_by
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
      return active
    },
    filterParams(): { [key: string]: any } {
      return {
        ...this.userFilterParams,
        within: this.boundingBoxJson,

        limit: EVENT_MAP_MAX_EVENTS,
        end_date_after: new Date(),
        // TODO: jonatan@ctrl.alt.coop
        // atm it's well possible to not set an end date of an event making it indefinitely going, so we include them
        // in the query... Maybe we should rethink that (mandatory/default end date?)
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
    }
  }
})
</script>
<style lang="scss">

.filter-content {
  padding: 1rem;
}

.select-wrapper {
  &:not(:last-of-type) {
    margin: 0 0 1rem 0;
  }
}
</style>
