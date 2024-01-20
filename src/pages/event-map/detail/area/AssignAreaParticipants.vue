<script setup lang="ts">
import { computed } from 'vue'
import { userStore } from 'src/store/UserStore'
import { EventParticipationDto } from 'src/api/model/EventParticipationDto'
import { QBtn, QSelect, useQuasar } from 'quasar'
import { useEventDetailStore } from 'pages/event-map/detail/EventDetailStoreMixin'
import { apiClient } from 'src/api/ApiClient'

const $q = useQuasar()

const {
  eventArea,
  isTeamCaptainOrCoordinator,
  personalParticipationPermissions,
  personalParticipation,
  participations,
  refreshParticipants
} = useEventDetailStore()

const user = computed(() => {
  return userStore.getState().user
})
const eventAreaParticipants = computed(() => {
  return participations.value.filter(({ assigned_event_areas }) => {
    return assigned_event_areas.includes(eventArea.value.id!)
  })
})
const isCampaignAdmin = computed(() => {
  return userStore.isCampaignAdmin()
})
const isUserEventAreaParticipant = computed(() => {
  return (
    (user.value !== null &&
      personalParticipation.value?.assigned_event_areas.includes(
        eventArea.value.id!
      )) ??
    false
  )
})
const onlyMemberParticipants = computed(() => {
  return participations.value.filter((item) => item.user_is_member)
})

async function joinArea() {
  if (personalParticipation.value) {
    personalParticipation.value = (
      await apiClient.eventParticipations.assignEventArea(
        personalParticipation.value.id.toString(),
        eventArea.value.id!
      )
    ).payload.data
  }
}
async function leaveArea() {
  if (personalParticipation.value) {
    personalParticipation.value = (
      await apiClient.eventParticipations.unassignEventArea(
        personalParticipation.value.id.toString(),
        eventArea.value.id!
      )
    ).payload.data
  }
}
async function updateAreaParticipations(
  newParticipations: EventParticipationDto[]
) {
  const participants = newParticipations.map(({ user }) => user)
  const changedParticipations: EventParticipationDto[] = []

  try {
    for (const participation of participations.value) {
      if (
        participants.includes(participation.user) &&
        !participation.assigned_event_areas.includes(eventArea.value.id!)
      ) {
        changedParticipations.push(
          (
            await apiClient.eventParticipations.patch(
              participation.id.toString(),
              {
                assigned_event_areas: [
                  ...participation.assigned_event_areas,
                  eventArea.value.id!
                ]
              }
            )
          ).payload.data
        )
      } else if (
        !participants.includes(participation.user) &&
        participation.assigned_event_areas.includes(eventArea.value.id!)
      ) {
        changedParticipations.push(
          (
            await apiClient.eventParticipations.patch(
              participation.id.toString(),
              {
                assigned_event_areas: participation.assigned_event_areas.filter(
                  (id) => id !== eventArea.value?.id
                )
              }
            )
          ).payload.data
        )
      }
    }
  } catch (e) {
    if (apiClient.isApiClientError(e) && e.response?.status === 404) {
      $q.notify({
        message: 'Die gewählte Person ist nicht mehr Teil der Aktion',
        timeout: 2000,
        color: 'negative'
      })
      await refreshParticipants()
    } else {
      $q.notify({
        message: 'Unbekannter fehler beim Aktualisieren der Teilnehmer*innen',
        timeout: 2000,
        color: 'negative'
      })
    }
  }
  updateParticipations(changedParticipations)
}
function updateParticipations(updatedParticipations: EventParticipationDto[]) {
  participations.value = participations.value.map((item) => {
    const changedItem = updatedParticipations.find(({ id }) => item.id === id)
    return changedItem ?? item
  })
}
</script>
<template>
  <QSelect
    v-if="isTeamCaptainOrCoordinator"
    :model-value="eventAreaParticipants"
    @update:model-value="updateAreaParticipations($event)"
    :multiple="true"
    label="Teilnehmer*innen"
    :options="onlyMemberParticipants"
    option-label="user_username"
    :display-value="
      eventAreaParticipants.map(({ user_username }) => user_username).join(',')
    "
  />
  <div
    v-else-if="personalParticipationPermissions?.assign_event_area?.POST"
    class="join-buttons"
  >
    <QBtn v-if="isUserEventAreaParticipant" @click="leaveArea" flat>
      Doch nicht hier mitmachen
    </QBtn>
    <QBtn v-else color="primary" @click="joinArea">
      In diesem Gebiet mitmachen
    </QBtn>
  </div>
</template>
<style lang="scss" scoped></style>
