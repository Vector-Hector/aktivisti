<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { CampaignDto } from 'src/api/model/CampaignDto'
import { userStore } from 'src/store/UserStore'
import { SubAssociationDto } from 'src/api/model/SubAssociationDto'
import EventFilter from 'components/EventFilter.vue'
import { EventStatus } from 'src/api/model/EventStatus'
import EventOverviewList from 'pages/event-map/overview/list/EventOverviewList.vue'
import { EventGeoJsonFeature } from 'src/api/model/EventGeoJsonDto'
import { apiClient } from 'src/api/ApiClient'
import { eventOverviewStore } from 'src/store/EventOverviewStore'
import { EventFilterParams } from 'src/api/params/EventFilterParams'
import { inside } from '@turf/turf'
import { polygonFromBBox } from 'src/utils/geometry'

const router = useRouter()

if (userStore.getState().bbox === null) {
  void router.replace({ name: 'splash' })
}

const campaigns = ref<CampaignDto[]>([])
const subAssociations = ref<SubAssociationDto[]>([])

const userFilterParams = computed({
  get() {
    const { campaign, subAssociations, sorting, eventType, status } =
      userStore.getState().filterPreferences
    return {
      sub_association: subAssociations,
      campaigns: campaign !== undefined ? [campaign] : undefined,
      order_by: sorting,
      event_type: eventType,
      status: status ?? EventStatus.ACTIVE
    }
  },
  set(value) {
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
})

async function updateEvents(params: EventFilterParams) {
  const response = await apiClient.eventGeometry.list(params)
  eventOverviewStore.state.featureCollection = response.payload.data
}

watch(
  userFilterParams,
  (newValue) => {
    void updateEvents(newValue)
  },
  { immediate: true }
)

const shownEvents = computed(() => {
  const bbox = eventOverviewStore.state.bbox
  return bbox
    ? eventOverviewStore.state.featureCollection?.features.filter(
        (eventFeature) => {
          return bbox && inside(eventFeature, polygonFromBBox(bbox))
        }
      ) ?? []
    : []
})

function goToEvent(event: EventGeoJsonFeature) {
  void router.push({
    name: 'event-detail',
    params: {
      eventId: event.id
    }
  })
}

onMounted(async () => {
  const [subAssociationResponse, campaignsResponse] = await Promise.all([
    apiClient.subAssociations.list(),
    apiClient.campaigns.list()
  ])

  subAssociations.value = subAssociationResponse.payload.data
  campaigns.value = campaignsResponse.payload.data
})
</script>

<template>
  <div class="container event-overview">
    <EventFilter
      v-model:filter-params="userFilterParams"
      :is-collapsible="true"
      :campaigns="campaigns"
      :sub-associations="subAssociations"
    />
    <EventOverviewList
      :events="shownEvents"
      :campaigns="campaigns"
      class="event-list"
      ref="eventList"
      @clickOnEvent="goToEvent"
    />
  </div>
</template>

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
