<template>
  <div class="managed-events">
    <div class="filter-content">
      <EventFilter
        v-model:filter-params="filterParams"
        :is-collapsible="true"
        :is-ownership-filterable="true"
        :is-campaign-filterable="false"
        :is-sub-association-filterable="false"
        :is-sort-order-configurable="false"
        :is-event-type-filterable="true"
      />
    </div>
    <EventList
      v-model:events="shownEvents"
      v-model:pagination="pagination"
      :filter-params="filterParams"
      :campaigns="campaigns"
      class="event-list"
      ref="eventList"
      @clickOnEvent="handleClickOnEvent"
      :filter="$props.filter"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { ionChevronDown, ionClose } from '@quasar/extras/ionicons-v5'

import { CampaignDto } from 'src/api/model/CampaignDto'
import EventList from 'components/EventList.vue'
import { Pagination } from 'src/api/model/APIEnvelope'
import { EVENT_LIST_CHUNK_SIZE } from 'src/constants'
import { EventDto } from 'src/api/model/EventDto'
import { EventStatus } from 'src/api/model/EventStatus'
import EventFilter from 'components/EventFilter.vue'
import { isEqual } from 'lodash-es'

const _defaultPagination = {
  limit: EVENT_LIST_CHUNK_SIZE
}

export default defineComponent({
  name: 'ManagedEvents',
  components: {
    EventFilter,
    EventList,
  },
  props: {
    /**
     * A filter function that can be passed to filter the results returned by
     * the api.
     */
    filter: {
      type: Function as PropType<(event: EventDto) => boolean>
    }
  },
  async created() {
    await this.updateShownEvents()
    await this.updateCampaigns()
  },
  emits: ['clickOnEvent'],
  data() {
    return {
      campaigns: [] as CampaignDto[],
      filterParams: {
        is_owner: true,
        management_permission: true,
        status: EventStatus.ACTIVE
      } as Record<string, number | string | boolean>,
      ionChevronDown,
      ionClose,
      pagination: _defaultPagination as Pagination | null,
      shownEvents: [] as EventDto[]
    }
  },
  methods: {
    handleClickOnEvent(event: EventDto){
      this.$emit('clickOnEvent', event)
    },
    resetPagination() {
      this.pagination = _defaultPagination as Pagination
    },
    async updateCampaigns() {
      this.campaigns = (await this.$apiClient.campaigns.list()).payload.data
    },
    async updateShownEvents() {
      try {
        const {data: events, pagination} = (await this.$apiClient.events.list(
          {
            ...this.pagination,
            ...this.filterParams
          }
        )).payload
        this.pagination = pagination!
        this.shownEvents = events
        if (this.filter) {
          this.shownEvents = this.shownEvents.filter(this.filter)
        }
      } catch {
        this.$q.notify({
          message: 'Etwas ging schief beim Abrufen der Aktionen',
          color: 'negative'
        })
      }
    }
  },
  watch: {
    filterParams: {
      async handler(newValue, oldValue) {
        if (isEqual(newValue, oldValue)) return
        // @ts-ignore
        this.$refs.eventList?.resetScrollPosition()
        this.resetPagination()
        await this.updateShownEvents()
      },
      deep: true,
      immediate: true
    }
  }
})
</script>

<style lang="scss" scoped>
@import "src/css/variables.scss";

.managed-events{
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.event-list {
  margin: 1rem 0;
  height: 100%;
  overflow: hidden;
}

.filter-content {
  padding: 1rem;
}
</style>

