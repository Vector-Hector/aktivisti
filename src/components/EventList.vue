<template>
  <InfiniteList
    :items="events"
    :disable="events.length === pagination.total"
    @load="loadData"
  >
    <template v-slot:item="{item}">
      <EventListItem
        clickable
        v-ripple
        @click="goToEvent(item)"
        :event="item"
        :campaigns="campaigns"
      />
    </template>
    <template v-slot:emptyList>
      Keine Aktionen gefunden
    </template>
  </InfiniteList>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { EventDto } from 'src/api/model/EventDto'
import { CampaignDto } from 'src/api/model/CampaignDto'
import { EVENT_LIST_CHUNK_SIZE } from 'src/constants'
import { Pagination } from 'src/api/model/APIEnvelope'
import { distinctBy } from 'src/utils/array'
import { ionPencil, ionTrash } from '@quasar/extras/ionicons-v5'
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
      type: Object as PropType<{[key: string]: string}>,
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
    }
  },
  emits: ['update:events', 'update:pagination'],
  computed: {
    isDisabled(): boolean {
      return this.pagination?.total === this.events.length
    }
  },
  data() {
    return {
      ionTrash,
      ionPencil
    }
  },
  methods: {
    goToEvent(event: EventDto) {
      void this.$router.push({
        name: 'event-detail',
        params: {
          eventId: event.id
        }
      })
    },
    async getEvents(pagination: Pagination) {
      const response = await this.$apiClient.events.list({
        ...this.filterParams,
        ...this.pagination,
        ...pagination
      })
      this.$emit('update:pagination', response.payload.pagination)
      return response.payload.data
    },
    async loadData(index: number, done: () => void) {
      if (this.isDisabled) {
        return
      }
      const pagination = {
        ...this.pagination!,
        limit: EVENT_LIST_CHUNK_SIZE,
        offset: (this.events?.length ?? 0)
      }
      const moreEvents = await this.getEvents(pagination)
      this.$emit('update:events', distinctBy(this.events.concat(moreEvents), (item: EventDto) => item.id))
      done()
    }
  }
})
</script>
