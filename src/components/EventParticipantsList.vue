<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { EventParticipationDto } from 'src/api/model/EventParticipationDto'
import { ionClose, ionCheckmark } from '@quasar/extras/ionicons-v5'
import { matArrowCircleUp } from '@quasar/extras/material-icons'
import {
  QBtn,
  QItem,
  QItemLabel,
  QItemSection,
  QList,
  QSeparator,
  QToolbarTitle,
  useQuasar
} from 'quasar'
import { apiClient } from 'src/api/ApiClient'

interface Props {
  eventId: number
  eventSubAssociation?: number
}

const props = defineProps<Props>()
const participations = ref<EventParticipationDto[]>([])

const $q = useQuasar()

onMounted(async () => {
  participations.value = (
    await apiClient.eventParticipations.list({
      event: props.eventId,
      is_pending_invitation: false
    })
  ).payload.data
})

const verifiedParticipations = computed(() => {
  return participations.value.filter(
    ({ is_verified, is_team_captain }) => !is_team_captain && is_verified
  )
})
const notVerifiedParticipations = computed(() => {
  return participations.value.filter(
    ({ is_verified, is_team_captain }) => !is_team_captain && !is_verified
  )
})
const areTeamCaptainsParticipations = computed(() => {
  return participations.value.filter(({ is_team_captain }) => is_team_captain)
})

async function deleteParticipation(deleteId: number) {
  participations.value = participations.value.filter(
    ({ id }) => deleteId !== id
  )
  await apiClient.eventParticipations.delete(deleteId.toString())
}

async function verifyParticipation(participationId: number) {
  const participationIndex = participations.value.findIndex(
    ({ id }) => participationId === id
  )
  const participationRequest = await apiClient.eventParticipations.patch(
    participationId.toString(),
    {
      is_verified: true
    }
  )
  participations.value[participationIndex] = participationRequest.payload.data
}
async function elevateToTeamCaptain(userId: number) {
  try {
    await apiClient.user.elevateToTeamCaptain(
      userId.toString(),
      props.eventSubAssociation
    )
    const participation = participations.value.find(
      ({ user }) => user === userId
    )
    participation!['is_team_captain'] = true
  } catch (e) {
    if (
      apiClient.isApiClientError(e) &&
      e.response?.status === 400 &&
      e.response?.data?.sub_association
    ) {
      $q.notify({
        color: 'negative',
        message:
          'Dieser Aktion ist kein gültiger Landkreis zugeordnet. Die Ernennung einer*eines Teamcaptains ' +
          'ist an einen Landkreis gebunden.'
      })
    } else {
      $q.notify({
        color: 'negative',
        message: 'Ein unerwarteter Fehler ist aufgetreten'
      })
    }
  }
}
function handleInviteToTeamCaptain(userId: number, username: string) {
  $q.dialog({
    title: 'Benutzer*innen zu Teamcaptain hochstufen',
    message: `Möchtest du die*den Benutzer*in <b>${username}</b> zur*zum Teamcaptain machen?`,
    html: true,
    cancel: true
  })
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    .onOk(() => elevateToTeamCaptain(userId))
}
</script>

<template>
  <div class="row">
    <div class="col">
      <QList v-if="areTeamCaptainsParticipations.length > 0">
        <QToolbarTitle>Teamcaptains</QToolbarTitle>
        <QSeparator spaced />
        <QItem
          v-for="participation in areTeamCaptainsParticipations"
          :key="participation.id"
        >
          <QItemSection>
            <QItemLabel v-if="participation.user_is_member">
              <q-item-label lines="1"
                ><b>{{ participation.user_username }} </b></q-item-label
              >
              <q-item-label caption>{{
                participation.user_email
              }}</q-item-label>
            </QItemLabel>
            <QItemLabel v-else>
              {{ participation.user_email }}
            </QItemLabel>
          </QItemSection>
          <QItemSection side>
            <div class="invitation-item-actions">
              <QBtn
                fill="none"
                size="md"
                :icon="ionClose"
                dense
                flat
                round
                @click="deleteParticipation(participation.id)"
                aria-label="Benutzer:in von der Aktion entfernen"
              />
            </div>
          </QItemSection>
        </QItem>
      </QList>
      <QList v-if="verifiedParticipations.length > 0">
        <QToolbarTitle>Bestätigte Teilnehmer*innen</QToolbarTitle>
        <QSeparator spaced />
        <QItem
          v-for="participation in verifiedParticipations"
          :key="participation.id"
        >
          <QItemSection>
            <QItemLabel v-if="participation.user_is_member">
              <q-item-label lines="1"
                ><b>{{ participation.user_username }} </b></q-item-label
              >
              <q-item-label caption>{{
                participation.user_email
              }}</q-item-label>
            </QItemLabel>
            <QItemLabel v-else>
              {{ participation.user_email }}
            </QItemLabel>
          </QItemSection>

          <QItemSection side>
            <div class="invitation-item-actions">
              <QBtn
                fill="none"
                size="md"
                :icon="ionClose"
                dense
                flat
                round
                @click="deleteParticipation(participation.id)"
                aria-label="Benutzer:in von der Aktion entfernen"
              />
              <QBtn
                v-if="!participation.is_event_coordinator"
                fill="none"
                size="md"
                :icon="matArrowCircleUp"
                dense
                flat
                round
                @click="
                  handleInviteToTeamCaptain(
                    participation.user,
                    participation.user_username
                  )
                "
                aria-label="Benutzer:in zu Teamcaptain machen"
              />
            </div>
          </QItemSection>
        </QItem>
      </QList>
      <QList v-if="notVerifiedParticipations.length > 0">
        <QToolbarTitle>Teilnehmer*innen bestätigen</QToolbarTitle>
        <QSeparator spaced />
        <QItem
          v-for="participation in notVerifiedParticipations"
          :key="participation.id"
        >
          <QItemSection>
            <QItemLabel v-if="participation.user_is_member">
              <q-item-label lines="1"
                ><b>{{ participation.user_username }} </b></q-item-label
              >
              <q-item-label caption>{{
                participation.user_email
              }}</q-item-label>
            </QItemLabel>
            <QItemLabel v-else>
              {{ participation.user_email }}
            </QItemLabel>
          </QItemSection>

          <QItemSection side>
            <div class="invitation-item-actions">
              <QBtn
                fill="none"
                size="md"
                dense
                flat
                round
                aria-label="Benutzer:in von der Aktion entfernen"
                :icon="ionClose"
                @click="deleteParticipation(participation.id)"
              />
              <QBtn
                fill="none"
                size="md"
                color="positive"
                :icon="ionCheckmark"
                dense
                flat
                round
                @click="verifyParticipation(participation.id)"
              />
            </div>
          </QItemSection>
        </QItem>
      </QList>
      <p
        v-if="
          verifiedParticipations.length === 0 &&
          notVerifiedParticipations.length === 0
        "
      >
        Niemand wartet auf Freischaltung. Lade noch mehr Leute zur Aktion ein.
      </p>
    </div>
  </div>
</template>

<style scoped></style>
