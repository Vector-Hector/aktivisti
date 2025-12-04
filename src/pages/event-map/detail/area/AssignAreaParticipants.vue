<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useUserStore } from 'src/stores/user'
import { EventParticipationDto } from 'src/api/model/EventParticipationDto'
import { QBtn, QIcon, QSelect, useQuasar } from 'quasar'
import { apiClient } from 'src/api/ApiClient'
import { useI18n } from 'vue-i18n'
import { useEventStore } from 'src/stores/event'
import { ionChevronDown, ionSearch } from '@quasar/extras/ionicons-v5'
import EventQrCodeButton from 'src/components/eventDetails/EventQrCodeButton.vue'
import { InvitationTokenDto } from 'src/api/model/InvitationTokenDto'

const $q = useQuasar()
const { t } = useI18n()
const userStore = useUserStore()

const eventStore = useEventStore()
const isTeamCaptainOrCoordinator = eventStore.isTeamCaptainOrCoordinator

const token = ref<InvitationTokenDto>()
const baseShareUrl = process.env.APP_SHARE_URL
const invitationUrl = computed(() => {
  return `${baseShareUrl}/t/${token?.value?.token}`
})

onMounted(async () => {
  if (isTeamCaptainOrCoordinator) {
    token.value = (
      await apiClient.eventAreas.generateInvitationToken(
        eventStore.eventArea.id
      )
    ).payload.data
  }
})

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
      eventStore.personalParticipation?.assigned_event_areas.includes(
        eventStore.eventArea.id!
      )) ??
    false
  )
})
const onlyMemberParticipants = computed(() => {
  return eventStore.participations.filter((item) => item.user_is_member)
})

async function joinArea() {
  if (eventStore.personalParticipation) {
    eventStore.setPersonalParticipation(
      (
        await apiClient.eventParticipations.assignEventArea(
          eventStore.personalParticipation.id.toString(),
          eventStore.eventArea.id!
        )
      ).payload.data
    )
    void eventStore.refreshEventAreas()
  }
}
async function leaveArea() {
  if (eventStore.personalParticipation) {
    eventStore.setPersonalParticipation(
      (
        await apiClient.eventParticipations.unassignEventArea(
          eventStore.personalParticipation.id.toString(),
          eventStore.eventArea.id!
        )
      ).payload.data
    )
    void eventStore.refreshEventAreas()
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
  void eventStore.refreshEventAreas()
  updateParticipations(changedParticipations)
}

const filteredOptions = ref<EventParticipationDto[]>()
function filterFn(val, update) {
  update(() => {
    const query = val.toLocaleLowerCase()
    filteredOptions.value = onlyMemberParticipants.value.filter(
      (participant) =>
        participant.user_username.toLocaleLowerCase().indexOf(query) > -1
    )
  })
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
  <div class="row" v-if="isTeamCaptainOrCoordinator">
    <EventQrCodeButton
      :url="invitationUrl"
      :small="true"
      :label="false"
      :show-url="false"
      :explanation="
        t('events.invitationToken.explanations.eventAreaInvitation')
      "
      image="pin"
    ></EventQrCodeButton>
    <QSelect
      use-input
      input-debounce="0"
      use-chips
      :multiple="true"
      :label="$t('events.details.area.assignAreaParticipant.inputPlaceholder')"
      :model-value="eventAreaParticipants"
      :options="filteredOptions"
      @filter="filterFn"
      @update:model-value="updateAreaParticipations($event)"
      option-label="user_username"
      dense
      :dropdown-icon="ionChevronDown"
    >
      <template v-slot:prepend> <QIcon :name="ionSearch" /> </template>
    </QSelect>
  </div>
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
<style lang="scss" scoped>
div.row {
  margin-top: 4px;
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: nowrap;
  .q-field {
    flex-grow: 1;
    flex-shrink: 1;
    min-width: 200px;
  }
}
</style>
