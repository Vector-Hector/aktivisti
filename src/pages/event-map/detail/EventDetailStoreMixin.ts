import { computed } from 'vue'
import { EventParticipationDto } from 'src/api/model/EventParticipationDto'
import { useEventStore } from 'src/stores/event'

export function useEventDetailStore() {
  const eventStore = useEventStore()

  const personalParticipation = computed({
    get: () => {
      return eventStore.personalParticipation
    },
    set: (value: EventParticipationDto | null) => {
      const oldParticipation = personalParticipation.value
      const existingParticipationIndex = eventStore.participations.findIndex(
        ({ id }) => oldParticipation?.id === id
      )
      // keep the participation list in sync
      if (value === null && existingParticipationIndex > -1) {
        eventStore.participations = eventStore.participations.filter(
          ({ id }) => oldParticipation?.id !== id
        )
      } else if (value !== null && existingParticipationIndex > -1) {
        const newParticipations = [...eventStore.participations]
        newParticipations[existingParticipationIndex] = value
        eventStore.participations = newParticipations
      } else if (value !== null && existingParticipationIndex === -1) {
        eventStore.participations = [...eventStore.participations, value]
      }
      eventStore.personalParticipation = value
    }
  })

  return {
    personalParticipation
  }
}
