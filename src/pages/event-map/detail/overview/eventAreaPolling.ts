import { apiClient } from 'src/api/ApiClient'
import { useEventStore } from 'src/stores/event'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const POLL_INTERVAL_MS = 5000

export function useEventAreaPolling() {
  const eventAreaPollTimer = ref<NodeJS.Timeout | null>(null)
  const eventStore = useEventStore()

  const shouldFetch = computed(
    () =>
      eventStore.personalParticipation?.is_verified ||
      eventStore.isTeamCaptainOrCoordinator
  )

  async function pollEventAreas() {
    const eventAreas = (
      await apiClient.eventAreas.list({ event: eventStore.event.id, status: 1 })
    ).payload.data
    const old = {}
    eventStore.eventAreas.forEach(area => {
      old[area.id] = area
    })
    eventAreas.forEach(area => {
      if (old[area.id]) {
        area.geometry = old[area.id].geometry
        area.area_details = old[area.id].area_details
      }
    })
    eventStore.eventAreas = eventAreas
  }

  function startPolling() {
    if (eventAreaPollTimer.value || !shouldFetch.value) {
      return
    }

    eventAreaPollTimer.value = setInterval(
      () => void pollEventAreas(),
      POLL_INTERVAL_MS
    )
  }

  function stopPolling() {
    if (eventAreaPollTimer.value) {
      clearInterval(eventAreaPollTimer.value)
      eventAreaPollTimer.value = null
    }
  }
  /**
   * Stop polling when tab isn't visible or hidden
   */
  function handleVisibilityChange() {
    if (document.hidden) {
      stopPolling()
    } else if (shouldFetch.value) {
      startPolling()
    }
  }

  onMounted(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange)

    if (shouldFetch.value) {
      startPolling()
    }
  })

  watch(shouldFetch, (newShouldFetch, oldShouldFetch) => {
    if (newShouldFetch === oldShouldFetch) return

    if (newShouldFetch) {
      startPolling()
    } else {
      stopPolling()
    }
  })

  onBeforeUnmount(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    stopPolling()
  })
}
