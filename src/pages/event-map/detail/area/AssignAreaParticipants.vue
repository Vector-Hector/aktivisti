<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from 'src/stores/user'
import { EventParticipationDto } from 'src/api/model/EventParticipationDto'
import { QBtn, QSelect, useQuasar } from 'quasar'
import { useEventDetailStore } from 'pages/event-map/detail/EventDetailStoreMixin'
import { apiClient } from 'src/api/ApiClient'
import { useI18n } from 'vue-i18n'
import { useEventStore } from 'src/stores/event'

const $q = useQuasar()
const { t } = useI18n()
const userStore = useUserStore()

const { personalParticipation } = useEventDetailStore()
const eventStore = useEventStore()

const user = computed(() => {
  return userStore.user
})
const eventAreaParticipants = computed(() => {
  return eventStore.participations.filter(({ assigned_event_areas }) => {
    return assigned_event_areas.includes(eventStore.eventArea.id!)
  })
})
const isUserEventAreaParticipant = computed(() => {
  return (
    (user.value !== null &&
      personalParticipation.value?.assigned_event_areas.includes(
        eventStore.eventArea.id!
      )) ??
    false
  )
})
const onlyMemberParticipants = computed(() => {
  return eventStore.participations.filter((item) => item.user_is_member)
})

async function joinArea() {
  if (personalParticipation.value) {
    personalParticipation.value = (
      await apiClient.eventParticipations.assignEventArea(
        personalParticipation.value.id.toString(),
        eventStore.eventArea.id!
      )
    ).payload.data
  }
}
async function leaveArea() {
  if (personalParticipation.value) {
    personalParticipation.value = (
      await apiClient.eventParticipations.unassignEventArea(
        personalParticipation.value.id.toString(),
        eventStore.eventArea.id!
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
    for (const participation of eventStore.participations) {
      if (
        participants.includes(participation.user) &&
        !participation.assigned_event_areas.includes(eventStore.eventArea.id!)
      ) {
        changedParticipations.push(
          (
            await apiClient.eventParticipations.patch(
              participation.id.toString(),
              {
                assigned_event_areas: [
                  ...participation.assigned_event_areas,
                  eventStore.eventArea.id!
                ]
              }
            )
          ).payload.data
        )
      } else if (
        !participants.includes(participation.user) &&
        participation.assigned_event_areas.includes(eventStore.eventArea.id!)
      ) {
        changedParticipations.push(
          (
            await apiClient.eventParticipations.patch(
              participation.id.toString(),
              {
                assigned_event_areas: participation.assigned_event_areas.filter(
                  (id) => id !== eventStore.eventArea?.id
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
        message: t(
          'events.details.area.assignAreaParticipant.notPartOfEventAnymoreError'
        ),
        timeout: 2000,
        color: 'negative'
      })
      await eventStore.refreshParticipants()
    } else {
      $q.notify({
        message: t('events.details.area.assignAreaParticipant.generalError'),
        timeout: 2000,
        color: 'negative'
      })
    }
  }
  updateParticipations(changedParticipations)
}
function updateParticipations(updatedParticipations: EventParticipationDto[]) {
  eventStore.setParticipations(
    eventStore.participations.map((item) => {
      const changedItem = updatedParticipations.find(({ id }) => item.id === id)
      return changedItem ?? item
    })
  )
}
</script>
<template>
  <QSelect
    v-if="eventStore.isTeamCaptainOrCoordinator"
    :model-value="eventAreaParticipants"
    @update:model-value="updateAreaParticipations($event)"
    :multiple="true"
    :label="$t('events.details.area.assignAreaParticipant.inputPlaceholder')"
    :options="onlyMemberParticipants"
    option-label="user_username"
    :display-value="
      eventAreaParticipants.map(({ user_username }) => user_username).join(',')
    "
  />
  <div
    v-else-if="
      eventStore.personalParticipationPermissions?.assign_event_area?.POST
    "
    class="join-buttons"
  >
    <QBtn v-if="isUserEventAreaParticipant" @click="leaveArea" flat>
      {{ $t('events.details.area.leaveButton') }}
    </QBtn>
    <QBtn v-else color="primary" @click="joinArea">
      {{ $t('events.details.area.joinButton') }}
    </QBtn>
  </div>
</template>
<style lang="scss" scoped></style>
