<!--FIXME(peter) 2023/12/12 The composition API doesn't support `beforeRouteEnter` so far so this a workaround
      see https://github.com/vuejs/rfcs/discussions/302-->
<script lang="ts">
/**
 * This is an exact copy of updateRoute(). Which is a result of the FIXME.
 */
async function updateRouteCopy(params: RouteParams) {
  const { areaId } = params
  if (areaId === UNDEFINED_POSTER_AREA) {
    // the special undefined route is for posters that are not assigned to an area
    eventDetailStore.setEventArea(null)
    eventDetailStore.setEventAreaPermissions(null)
    uiStore.updateActiveElements({
      eventArea: UNDEFINED_POSTER_AREA
    })
  } else {
    const response = await apiClient.eventAreas.get(
      params.areaId as string,
      [],
      { show_permissions: true }
    )
    eventDetailStore.setEventArea(response.payload.data)
    eventDetailStore.setEventAreaPermissions(response.payload.permissions)
    uiStore.updateActiveElements({
      eventArea: response.payload.data.name
    })
  }
}
export default defineComponent({
  async beforeRouteEnter(to, from, next) {
    await updateRouteCopy(to.params)
    next()
  }
})
</script>

<script setup lang="ts">
import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
import { apiClient } from 'src/api/ApiClient'
import { eventDetailStore } from 'src/store/EventDetailStore'
import Timeout = NodeJS.Timeout
import { EventTypes } from 'src/api/model/EventTypes'
import { RouteParams, onBeforeRouteUpdate } from 'vue-router'
import { uiStore } from 'src/store/UiStore'
import { UNDEFINED_POSTER_AREA } from 'pages/event-map/detail/area/posters/detail/EventDetailPosterDetail.vue'
import { useEventDetailStore } from 'pages/event-map/detail/EventDetailStoreMixin'

const { event, eventArea } = useEventDetailStore()

const nextPoll = ref<Timeout | null>(null)

async function updateRoute(params: RouteParams) {
  const { areaId } = params
  if (areaId === UNDEFINED_POSTER_AREA) {
    // the special undefined route is for posters that are not assigned to an area
    eventDetailStore.setEventArea(null)
    eventDetailStore.setEventAreaPermissions(null)
    uiStore.updateActiveElements({
      eventArea: UNDEFINED_POSTER_AREA
    })
  } else {
    const response = await apiClient.eventAreas.get(
      params.areaId as string,
      [],
      { show_permissions: true }
    )
    eventDetailStore.setEventArea(response.payload.data)
    eventDetailStore.setEventAreaPermissions(response.payload.permissions)
    uiStore.updateActiveElements({
      eventArea: response.payload.data.name
    })
  }
}

onMounted(async () => {
  if (event.value.event_type !== EventTypes.POSTERS) {
    await pollForCompletionNotes()
  }
})

onUnmounted(() => {
  if (nextPoll.value !== null) {
    clearTimeout(nextPoll.value)
  }
})

async function pollForCompletionNotes() {
  eventDetailStore.addCompletionNotes(
    (
      await apiClient.completionNotes.list({
        event_area: eventArea.value.id
      })
    ).payload.data
  )
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  nextPoll.value = setTimeout(() => pollForCompletionNotes(), 5000)
}

onBeforeRouteUpdate(async (to, from, next) => {
  await updateRoute(to.params)
  next()
})
</script>

<template>
  <router-view />
</template>

<style lang="scss" scoped>
label {
  text-align: left;
}

.campaign {
  font-weight: bold;
  display: block;
}

.event-area-title {
  margin: 0.8rem 0 0 0;
}

.map {
  min-height: 180px;
  margin-bottom: 1.5em;
}

.button-group {
  margin-top: 1.5em;
}

.event-name {
  font-weight: bold;
  font-size: 1rem;
}
</style>
