<template>
  <InfiniteList
    :items="events"
    :disable="isDisabled"
    @load="loadData"
    ref="infiniteList"
  >
    <template v-slot:item="{ item }">
      <EventListItem
        clickable
        v-ripple
        @click="handleClickOnEvent(item)"
        @delete="handleDeleteEvent()"
        :event="item"
        :campaigns="campaigns"
        :show-management-control-buttons="showManagementControlButtons"
      />
    </template>
    <template v-slot:emptyList> Keine Aktionen im Gebiet gefunden </template>
  </InfiniteList>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { EventDto } from 'src/api/model/EventDto'
import { CampaignDto } from 'src/api/model/CampaignDto'
import { EVENT_LIST_CHUNK_SIZE } from 'src/constants'
import { Pagination } from 'src/api/model/APIEnvelope'
import { distinctBy } from 'src/utils/array'
import EventListItem from 'components/EventListItem.vue'
import InfiniteList from 'components/InfiniteList.vue'

export default defineComponent({
  name: 'EventList',
  components: {
    InfiniteList,
    EventListItem
  },
  props: {
    filterParams: {
      type: Object as PropType<{ [key: string]: unknown }>,
      required: true
    },
    events: {
      type: Array as PropType<EventDto[]>,
      default: () => []
    },
    pagination: {
      type: Object as PropType<Pagination | null>,
      default: null
    },
    campaigns: {
      type: Array as PropType<CampaignDto[]>,
      default: () => []
    },
    /**
     * A filter function that can be passed to filter the results returned by
     * the api.
     */
    filter: {
      type: Function as PropType<(event: EventDto) => boolean>
    },
    showManagementControlButtons: Boolean
  },
  emits: [
    'clickOnEvent',
    'update:events',
    'update:delete',
    'update:pagination'
  ],
  computed: {
    isDisabled(): boolean {
      let filteredEventsCount = 0
      if (this.filter) {
        filteredEventsCount = this.events.filter(this.filter).length
      }
      return this.pagination?.total
        ? this.pagination?.total <= this.events.length + filteredEventsCount
        : false
    }
  },
  methods: {
    handleClickOnEvent(event: EventDto) {
      this.$emit('clickOnEvent', event)
    },
    handleDeleteEvent() {
      this.$emit('update:delete')
    },
    async getEvents() {
      const response = await this.$apiClient.events.list({
        ...this.filterParams,
        limit: EVENT_LIST_CHUNK_SIZE,
        offset: this.events?.length ?? 0
      })
      this.$emit('update:pagination', response.payload.pagination)
      return response.payload.data
    },
    async loadData(index: number, done: () => void) {
      if (this.isDisabled) {
        return
      }
      const moreEvents = await this.getEvents()
      let consolidatedEvents = distinctBy(
        this.events?.concat(moreEvents),
        (item: EventDto) => item.id
      )
      if (this.filter) {
        consolidatedEvents = consolidatedEvents.filter(this.filter)
      }
      this.$emit('update:events', consolidatedEvents)
      done()
    },
    resetScrollPosition() {
      // @ts-ignore
      this.$refs.infiniteList.resetScrollPosition()
    }
  }
})
</script>
