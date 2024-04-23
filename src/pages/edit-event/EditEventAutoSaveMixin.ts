import { computed, ref, watch } from 'vue'
import { EventDto } from 'src/api/model/EventDto'
import { cloneDeep, isEqual } from 'lodash-es'
import { SettleDebouncer } from 'src/utils/debounce'
import { useEditEventMixin } from 'pages/edit-event/EditEventMixin'
import { useQuasar } from 'quasar'
import { apiClient } from 'src/api/ApiClient'

export function useEditEventAutoSaveMixin() {
  const $q = useQuasar()

  const { event } = useEditEventMixin()
  const lastSavedEvent = ref<EventDto | null>(null)
  const errors = ref<Record<string, unknown>>({})

  const saveDebouncer = new SettleDebouncer()

  const normalizedEventCopy = (newEvent: EventDto) => {
    return cloneDeep({
      ...newEvent,
      // normalize the date format
      start_date: new Date(event.value.start_date).toISOString(),
      end_date: new Date(event.value.end_date).toISOString()
    })
  }
  const saveEvent = async () => {
    errors.value = {}
    try {
      const updatedEvent = (
        await apiClient.events.update(event.value.id.toString(), {
          ...event.value
        })
      ).payload.data
      lastSavedEvent.value = normalizedEventCopy(updatedEvent)
      $q.notify({
        color: 'positive',
        message: 'Gespeichert'
      })
    } catch (e) {
      if (apiClient.isApiClientError(e) && e.response?.status === 400) {
        errors.value = e.response.data
        $q.notify({
          color: 'negative',
          message: 'Bitte korrigiere die Fehler im Formular'
        })
      } else {
        errors.value = {
          'non-field-error': 'Ein unbekannter Fehler ist aufgetreten'
        }
        $q.notify({
          color: 'negative',
          message: 'Beim speichern des events ist etwas schiefgegangen'
        })
      }
    }
  }

  lastSavedEvent.value = normalizedEventCopy(event.value)

  const currentEvent = computed(() => {
    // a deep copy of the event so we can track nested changes
    return normalizedEventCopy(event.value)
  })

  watch(
    () => currentEvent.value,
    (newValue) => {
      void saveDebouncer.executeDebounced(async () => {
        if (!isEqual(lastSavedEvent.value, newValue)) {
          await saveEvent()
        } else {
          errors.value = {}
        }
      })
    },
    { deep: true }
  )

  return {
    errors,
    saveDebouncer
  }
}
