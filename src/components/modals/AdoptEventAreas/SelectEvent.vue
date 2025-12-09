<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import { CampaignDto } from 'src/api/model/CampaignDto'
import EventList from 'components/EventList.vue'
import { Pagination } from 'src/api/model/APIEnvelope'
import { EVENT_LIST_CHUNK_SIZE } from 'src/constants'
import { EventDto } from 'src/api/model/EventDto'
import EventFilter from 'components/EventFilter.vue'
import { isEqual } from 'lodash-es'
import { EventTypes as EventTypesModel } from 'src/api/model/EventTypes'
import { EventFilterParams } from 'src/api/params/EventFilterParams'
import { SubAssociationDto } from 'src/api/model/SubAssociationDto'
import { editEventStore } from 'src/store/EditEventStore'
import { QScrollArea, useQuasar } from 'quasar'
import { apiClient } from 'src/api/ApiClient'
import { DEFAULT_FILTER_PREFERENCES, useUserStore } from 'src/stores/user'
import { ContentTypeNaturalKey } from 'src/api/model/ContentTypeDto'
import { ObjectPermissions } from 'src/api/model/ObjectPermissionDto'

const $q = useQuasar()
const userStore = useUserStore()

const _defaultPagination = {
  limit: EVENT_LIST_CHUNK_SIZE
}
const _defaultFilterPreference = {
  sub_association: DEFAULT_FILTER_PREFERENCES.subAssociations,
  campaigns: DEFAULT_FILTER_PREFERENCES.campaign,
  order_by: DEFAULT_FILTER_PREFERENCES.sorting,
  event_type: DEFAULT_FILTER_PREFERENCES.eventType,
  status: DEFAULT_FILTER_PREFERENCES.status,
  is_owner: DEFAULT_FILTER_PREFERENCES.is_owner,
  management_permission: DEFAULT_FILTER_PREFERENCES.management_permission,
  include_expired_campaigns: true
}

interface Props {
  /**
   * A filter function that can be passed to filter the events shown.
   */
  filter?: (event: EventDto) => boolean
}

interface Emits {
  (e: 'clickOnEvent', event: EventDto): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const campaigns = ref<CampaignDto[]>([])
const mySubAssociations = ref<SubAssociationDto[]>([])
const subAssociations = ref<SubAssociationDto[]>([])
const filterParams = ref<EventFilterParams>({
  ..._defaultFilterPreference,
  event_type: editEventStore.state.event?.event_type
})
const pagination = ref<Pagination | null>(_defaultPagination)
const shownEvents = ref<EventDto[]>([])
const myPermissions = computed(() => {
  return userStore.myPermissions
})

onMounted(async () => {
  await updateShownEvents()
  await updateCampaigns()
  await updateSubAssociations()
})

const EventTypes = computed(() => EventTypesModel)

watch(
  filterParams,
  async (newValue, oldValue) => {
    if (isEqual(newValue, oldValue)) return
    resetPagination()
    await updateShownEvents()
  },
  {
    deep: true,
    immediate: true
  }
)

function handleClickOnEvent(event: EventDto) {
  emit('clickOnEvent', event)
}
function resetPagination() {
  pagination.value = _defaultPagination as Pagination
}
async function updateCampaigns() {
  campaigns.value = (
    await apiClient.campaigns.list({ include_expired: true })
  ).payload.data
}
async function updateSubAssociations() {
  subAssociations.value = (await apiClient.subAssociations.list()).payload.data
  if (userStore.isAdminOrGlobalCoordinator) {
    mySubAssociations.value = subAssociations.value
  } else {
    if (myPermissions.value.length > 0) {
      mySubAssociations.value = await getMySubAssociations()
    } else {
      mySubAssociations.value = []
    }
  }
}

async function getMySubAssociations() {
  //Sub association I have direct permissions for
  const mySubAssociationsIds = myPermissions.value
    .filter(
      (permission) =>
        permission.content_type_natural_key ===
          ContentTypeNaturalKey.SUB_ASSOCIATION &&
        permission.permission_codename === ObjectPermissions.Coordinator
    )
    .map((permission) => permission.object_pk)
  const mySubAssociations = subAssociations.value.filter(({ id }) =>
    mySubAssociationsIds.includes(id.toString())
  )
  // take care of corresponding subassociations if I have state association permission
  const myStateAssociationIds = myPermissions.value
    .filter(
      (permission) =>
        permission.content_type_natural_key ===
          ContentTypeNaturalKey.STATE_ASSOCIATION &&
        permission.permission_codename === ObjectPermissions.Coordinator
    )
    .map((permission) => permission.object_pk)
  const subAssociationsInMyStateAssociations = [] as SubAssociationDto[]
  for (const stateAssociationId of myStateAssociationIds) {
    const newSubAssociations = await getSubAssociations(
      parseInt(stateAssociationId)
    )
    subAssociationsInMyStateAssociations.push(...newSubAssociations)
  }
  for (const subAssociation of subAssociationsInMyStateAssociations) {
    if (!mySubAssociationsIds.includes(subAssociation.id.toString())) {
      mySubAssociations.push(subAssociation)
    }
  }
  return mySubAssociations
}

async function getSubAssociations(stateAssociationId?: number) {
  return (
    await apiClient.subAssociations.list({
      state_association: stateAssociationId
    })
  ).payload.data
}

async function updateShownEvents() {
  try {
    const { data: events, pagination: newPagination } = (
      await apiClient.events.list({
        ...pagination.value,
        ...filterParams.value
      })
    ).payload
    pagination.value = newPagination!
    shownEvents.value = events
    if (props.filter) {
      shownEvents.value = shownEvents.value.filter(props.filter)
    }
  } catch {
    $q.notify({
      message: 'Etwas ging schief beim Abrufen der Aktionen',
      color: 'negative'
    })
  }
}

function handleResetClick() {
  filterParams.value = _defaultFilterPreference
}
</script>

<template>
  <div class="select-events">
    <QScrollArea class="scroll-area">
      <div class="filter-content">
        <EventFilter
          v-model:filter-params="filterParams"
          is-collapsible
          is-ownership-filterable
          is-campaign-filterable
          is-sub-association-filterable
          is-sort-order-configurable
          is-event-type-filterable
          :sub-associations="mySubAssociations"
          :campaigns="campaigns"
          :avalable-event-types="[
            EventTypes.DOOR_TO_DOOR,
            EventTypes.FLYERS,
            EventTypes.POSTERS
          ]"
          @on-reset-click="() => handleResetClick()"
        />
      </div>
      <EventList
        v-model:events="shownEvents"
        v-model:pagination="pagination"
        :filter="props.filter"
        :filter-params="filterParams"
        :campaigns="campaigns"
        class="event-list"
        @clickOnEvent="handleClickOnEvent"
      />
    </QScrollArea>
  </div>
</template>
<style lang="scss" scoped>
@import 'src/css/variables.scss';

.scroll-area {
  height: 100%;
}

.select-events {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.event-list {
  margin: 1rem 0;
  overflow: hidden;
}

.filter-content {
  padding: 1rem;
}
</style>
