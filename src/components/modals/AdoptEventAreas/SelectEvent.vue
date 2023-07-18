<template>
  <div class="managed-events">
    <div class="filter-content">
      <EventFilter
        v-model:filter-params="filterParams"
        is-collapsible
        is-ownership-filterable
        is-campaign-filterable
        is-sub-association-filterable
        is-sort-order-configurable
        is-event-type-filterable
        :sub-associations="subAssociations"
        :campaigns="campaigns"
        :avalable-event-types="[
          EventTypes.DOOR_TO_DOOR,
          EventTypes.FLYERS,
          EventTypes.POSTERS
        ]"
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
      @update:delete="updateShownEvents()"
      :show-management-control-buttons="true"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { ionChevronDown, ionClose } from '@quasar/extras/ionicons-v5'

import { CampaignDto } from 'src/api/model/CampaignDto'
import EventList from 'components/EventList.vue'
import { Pagination } from 'src/api/model/APIEnvelope'
import { EVENT_LIST_CHUNK_SIZE } from 'src/constants'
import { EventDto } from 'src/api/model/EventDto'
import EventFilter from 'components/EventFilter.vue'
import { isEqual } from 'lodash-es'
import { EventTypes } from 'src/api/model/EventTypes'
import { EventFilterParams } from 'src/api/params/EventFilterParams'
import { SubAssociationDto } from 'src/api/model/SubAssociationDto'
import { editEventStore } from 'src/store/EditEventStore'

const _defaultPagination = {
  limit: EVENT_LIST_CHUNK_SIZE
}

export default defineComponent({
  name: 'ManagedEvents',
  computed: {
    EventTypes() {
      return EventTypes
    }
  },
  components: {
    EventFilter,
    EventList
  },
  async created() {
    await this.updateShownEvents()
    await this.updateCampaigns()
    await this.updateSubAssociations()
  },
  emits: ['clickOnEvent'],
  data() {
    return {
      campaigns: [] as CampaignDto[],
      subAssociations: [] as SubAssociationDto[],
      filterParams: {
        event_type: editEventStore.state.event?.event_type
      } as EventFilterParams,
      ionChevronDown,
      ionClose,
      pagination: _defaultPagination as Pagination | null,
      shownEvents: [] as EventDto[]
    }
  },
  methods: {
    handleClickOnEvent(event: EventDto) {
      this.$emit('clickOnEvent', event)
    },
    resetPagination() {
      this.pagination = _defaultPagination as Pagination
    },
    async updateCampaigns() {
      this.campaigns = (
        await this.$apiClient.campaigns.list({ include_expired: true })
      ).payload.data
    },
    async updateSubAssociations() {
      this.subAssociations = (
        await this.$apiClient.subAssociations.list()
      ).payload.data
    },
    async updateShownEvents() {
      try {
        const { data: events, pagination } = (
          await this.$apiClient.events.list({
            ...this.pagination,
            ...this.filterParams
          })
        ).payload
        this.pagination = pagination!
        this.shownEvents = events
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
@import 'src/css/variables.scss';

.managed-events {
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
