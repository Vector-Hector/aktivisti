<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { EventParticipationDto } from 'src/api/model/EventParticipationDto'
import { userStore } from 'src/store/UserStore'
import { ionClose, ionPersonAddSharp } from '@quasar/extras/ionicons-v5'
import {
  QBtn,
  QIcon,
  QInput,
  QItem,
  QItemLabel,
  QItemSection,
  QList,
  useQuasar
} from 'quasar'
import { apiClient } from 'src/api/ApiClient'

interface Props {
  eventId: number
}

const props = defineProps<Props>()

const $q = useQuasar()

const isLoading = ref(false)
const usernameToInvite = ref('')
const participations = ref<EventParticipationDto[]>([])

onMounted(async () => {
  participations.value = (
    await apiClient.eventParticipations.list({
      event: props.eventId,
      is_pending_invitation: true
    })
  ).payload.data
})

const pendingUsersWithoutVisibleEmailAddresses = computed(() => {
  return participations.value.filter(
    (item) => !item.user_is_member && item.user_email === null
  ).length
})
const displayedParticipations = computed(() => {
  return participations.value
    .filter((item) => item.user_is_member || item.user_email !== null)
    .filter((item) => {
      return item.user != userStore.getState().user?.id
    })
    .sort((a, b) => {
      return a.user_username.localeCompare(b.user_username)
    })
})

async function inviteUser(username: string) {
  const inviteRequestBody = {
    users: [username]
  }
  try {
    isLoading.value = true
    const response = await apiClient.events.invite(
      props.eventId.toString(),
      inviteRequestBody
    )
    for (const item of response.payload.data) {
      if (!participations.value.find(({ id }) => id === item.id)) {
        participations.value.push(item)
      }
    }
  } catch (error) {
    if (apiClient.isApiClientError(error) && error.response?.status === 400) {
      $q.notify({
        color: 'negative',
        message: 'Der Benutzer*innenname existiert nicht'
      })
    } else {
      $q.notify({
        color: 'negative',
        message: 'Etwas ging schief beim Einladen des*der Benutzer*in'
      })
    }
  } finally {
    isLoading.value = false
  }
}
// TODO(peter) Remove code duplication
function handleInviteAllCoordinators() {
  $q.dialog({
    title: 'Alle Koordinator*innen einladen',
    message: 'Möchtest du alle Koordinator*innen des Kreisverbandes einladen?',
    cancel: true
  })
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    .onOk(() => inviteCoordinators())
}
async function inviteCoordinators() {
  const response = await apiClient.events.inviteCoordinators(
    props.eventId.toString()
  )
  const newParticipations = response.payload.data
  if (newParticipations.length > 0) {
    let areCoordinatorsAlreadyInvited = true
    for (const participation of response.payload.data) {
      if (!participations.value.find(({ id }) => id === participation.id)) {
        areCoordinatorsAlreadyInvited = false
        participations.value.push(participation)
      }
    }
    if (areCoordinatorsAlreadyInvited) {
      $q.notify({
        color: 'warning',
        message: 'Es wurden bereits alle Koordinator*innen eingeladen.'
      })
    }
  } else {
    $q.notify({
      color: 'info',
      message: 'In diesem Eventgebiet gibt es keine Koordinator*innen.'
    })
  }
}
function handleInviteAllTeamCaptains() {
  $q.dialog({
    title: 'Alle Teamcaptains einladen',
    message: 'Möchtest du alle Teamcaptains des Kreisverbandes einladen?',
    cancel: true
  })
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    .onOk(() => inviteTeamCaptains())
}
async function inviteTeamCaptains() {
  const response = await apiClient.events.inviteTeamCaptains(
    props.eventId.toString()
  )
  const newParticipations = response.payload.data
  if (newParticipations.length > 0) {
    let areTeamCaptainsAlreadyInvited = true
    for (const participation of response.payload.data) {
      if (!participations.value.find(({ id }) => id === participation.id)) {
        areTeamCaptainsAlreadyInvited = false
        participations.value.push(participation)
      }
    }
    if (areTeamCaptainsAlreadyInvited) {
      $q.notify({
        color: 'warning',
        message: 'Es wurden bereits alle Teamcaptains eingeladen.'
      })
    }
  } else {
    $q.notify({
      color: 'info',
      message: 'In diesem Eventgebiet gibt es keine Teamcaptains.'
    })
  }
}
async function deleteParticipation(deleteId: number) {
  participations.value = participations.value.filter(
    ({ id }) => deleteId !== id
  )
  await apiClient.eventParticipations.delete(deleteId.toString())
}
</script>

<template>
  <div class="q-qa-sm">
    <div class="row">
      <div class="col-grow">
        <QInput
          use-input
          dense
          v-model="usernameToInvite"
          placeholder="Benutzer*innenname"
          class="w-100 d-flex flex-col"
          @keydown.enter="inviteUser(usernameToInvite)"
        />
      </div>
      <div class="col-auto">
        <QBtn
          :icon="ionPersonAddSharp"
          color="primary"
          :disable="isLoading"
          flat
          round
          small
          @click="inviteUser(usernameToInvite)"
        />
      </div>
    </div>
    <div class="row">
      <div class="col">
        <QList v-if="participations.length > 0">
          <p>Bereits eingeladen:</p>
          <QItem
            v-for="participation in displayedParticipations"
            :key="participation.id"
          >
            <QItemSection>
              <QItemLabel v-if="participation.user_is_member">
                <b>{{ participation.user_username }}</b>
                {{ participation.user_email }}
              </QItemLabel>
              <QItemLabel v-else>
                {{ participation.user_email }}
              </QItemLabel>
            </QItemSection>

            <QItemSection side>
              <div class="invitation-item-actions">
                <QIcon
                  fill="none"
                  @click="deleteParticipation(participation.id)"
                >
                  <QIcon
                    :name="ionClose"
                    aria-label="Benutzer:in von der Aktion entfernen"
                  />
                </QIcon>
              </div>
            </QItemSection>
          </QItem>
          <QItem v-if="pendingUsersWithoutVisibleEmailAddresses > 0">
            <QItemSection>
              <QItemLabel>
                {{ pendingUsersWithoutVisibleEmailAddresses }} weitere per Mail
                eingeladen
              </QItemLabel>
            </QItemSection>
          </QItem>
        </QList>
        <p v-else>
          Keine offenen Einladungen. Nutze das Eingabefeld um neue Teilnehmende
          einzuladen
        </p>
      </div>
    </div>
    <div class="row invite-users">
      <QBtn class="full-width" @click="handleInviteAllCoordinators">
        Alle Koordinator*innen einladen
      </QBtn>
    </div>
    <div class="row invite-users">
      <QBtn class="full-width" @click="handleInviteAllTeamCaptains">
        Alle Teamcaptains einladen
      </QBtn>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import 'src/css/utils';
@import 'src/css/_variables.scss';

.user-autocomplete-username {
  font-weight: bold;
}

.invitation-item-actions {
  display: flex;
  flex-direction: row;
}

.invited-button {
  color: $grey-4;
  justify-self: center;
  align-self: center;
}

.invite-users {
  margin: 0.5rem;
}
</style>
