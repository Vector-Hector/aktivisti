import { computed } from 'vue'
import { EventParticipationDto } from 'src/api/model/EventParticipationDto'
import { apiClient } from 'src/api/ApiClient'
import { useEventStore } from 'src/stores/event'

export function useEventDetailStore() {
  const eventStore = useEventStore()

  const participations = computed({
    get: () => {
      return eventStore.participations
    },
    set: (value: EventParticipationDto[]) => {
      const personalParticipationAlt = value.find(
        ({ id }) => id === personalParticipation.value?.id
      )
      // if the update contains the personal one keep them in sync
      if (personalParticipationAlt) {
        eventStore.setPersonalParticipation(personalParticipationAlt)
      }
      eventStore.setParticipations(value)
    }
  })

  const personalParticipation = computed({
    get: () => {
      return eventStore.personalParticipation
    },
    set: (value: EventParticipationDto | null) => {
      const oldParticipation = personalParticipation.value
      const existingParticipationIndex = participations.value.findIndex(
        ({ id }) => oldParticipation?.id === id
      )
      // keep the participation list in sync
      if (value === null && existingParticipationIndex > -1) {
        eventStore.setParticipations(
          participations.value.filter(({ id }) => oldParticipation?.id !== id)
        )
      } else if (value !== null && existingParticipationIndex > -1) {
        const newParticipations = [...participations.value]
        newParticipations[existingParticipationIndex] = value
        eventStore.setParticipations(newParticipations)
      } else if (value !== null && existingParticipationIndex === -1) {
        eventStore.setParticipations([...participations.value, value])
      }
      eventStore.setPersonalParticipation(value)
    }
  })

  const personalParticipationPermissions = computed(() => {
    return eventStore.personalParticipationPermissions
  })

  const refreshParticipants = async () => {
    participations.value = (
      await apiClient.eventParticipations.list({
        event: eventStore.event.id
      })
    ).payload.data
  }

  return {
    personalParticipationPermissions,
    participations,
    personalParticipation,
    refreshParticipants
  }
}
