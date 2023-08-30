<script setup lang="ts">
import { computed } from 'vue'
import { EventDto } from 'src/api/model/EventDto'
import { CampaignDto } from 'src/api/model/CampaignDto'
import { EVENT_LIST_CHUNK_SIZE } from 'src/constants'
import { Pagination } from 'src/api/model/APIEnvelope'
import { distinctBy } from 'src/utils/array'
import EventListItem from 'components/EventListItem.vue'
import InfiniteList from 'components/InfiniteList.vue'
import { apiClient } from 'src/api/ApiClient'

interface Props {
  filterParams: { [key: string]: unknown }
  events?: EventDto[]
  pagination?: Pagination | null
  campaigns?: CampaignDto[]
  /**
   * A filter function that can be passed to filter the results returned by
   * the api.
   */
  filter?: (event: EventDto) => boolean
  showManagementControlButtons?: boolean
}

interface Emit {
  (e: 'clickOnEvent', event: EventDto): void

  (e: 'update:events', events: EventDto[]): void

  (e: 'update:delete'): void

  (e: 'update:pagination', pagination: Pagination | undefined): void
}

const emit = defineEmits<Emit>()

const props = withDefaults(defineProps<Props>(), {
  events: () => [],
  pagination: null,
  campaigns: () => [],
  showManagementControlButtons: false
})

const isDisabled = computed(() => {
  let filteredEventsCount = 0
  if (props.filter) {
    filteredEventsCount = props.events.filter(props.filter).length
  }
  return props.pagination?.total
    ? props.pagination?.total <= props.events.length + filteredEventsCount
    : false
})

function handleClickOnEvent(event: EventDto) {
  emit('clickOnEvent', event)
}

function handleDeleteEvent() {
  emit('update:delete')
}

async function getEvents() {
  const response = await apiClient.events.list({
    ...props.filterParams,
    limit: EVENT_LIST_CHUNK_SIZE,
    offset: props.events?.length ?? 0
  })
  emit('update:pagination', response.payload.pagination)
  return response.payload.data
}

async function loadData(index: number, done: () => void) {
  if (isDisabled.value) {
    return
  }
  const moreEvents = await getEvents()
  let consolidatedEvents = distinctBy(
    props.events?.concat(moreEvents),
    (item: EventDto) => item.id
  )
  if (props.filter) {
    consolidatedEvents = consolidatedEvents.filter(props.filter)
  }
  emit('update:events', consolidatedEvents)
  done()
}

function resetScrollPosition() {
  // @ts-ignore
  this.$refs.infiniteList.resetScrollPosition()
}

defineExpose({
  resetScrollPosition
})
</script>
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
        :campaigns="props.campaigns"
        :show-management-control-buttons="showManagementControlButtons"
      />
    </template>
    <template v-slot:emptyList> Keine Aktionen im Gebiet gefunden</template>
  </InfiniteList>
</template>
