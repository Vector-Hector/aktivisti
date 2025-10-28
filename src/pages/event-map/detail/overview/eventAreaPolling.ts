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
    eventStore.eventAreas = (
      await apiClient.eventAreas.list({ event: eventStore.event.id })
    ).payload.data
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
