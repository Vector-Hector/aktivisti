<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { EventParticipationDto } from 'src/api/model/EventParticipationDto'
import { useUserStore } from 'src/stores/user'
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
import { useI18n } from 'vue-i18n'
import EventQrCodeButton from 'src/components/eventDetails/EventQrCodeButton.vue'
import { InvitationTokenDto } from 'src/api/model/InvitationTokenDto'
import { useEventStore } from 'src/stores/event'

interface Props {
  eventId: number
}

const props = defineProps<Props>()

const $q = useQuasar()
const { t } = useI18n()
const userStore = useUserStore()
const eventStore = useEventStore()

const isLoading = ref(false)
const usernameToInvite = ref('')
const participations = ref<EventParticipationDto[]>([])
const token = ref<InvitationTokenDto>()
const baseShareUrl = process.env.APP_SHARE_URL
const validateTokenUrl = computed(() => {
  return `${baseShareUrl}/t/${token.value.token}`
})

onMounted(async () => {
  participations.value = (
    await apiClient.eventParticipations.list({
      event: props.eventId,
      is_pending_invitation: true
    })
  ).payload.data
  if (eventStore.isCoordinator) {
    token.value = (
      await apiClient.events.generateInvitationToken(props.eventId.toString())
    ).payload.data
  }
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
      return item.user != userStore.user?.id
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
        message: t(
          'events.details.inviteUsers.dialog.notifications.userNameNotExistsError'
        )
      })
    } else {
      $q.notify({
        color: 'negative',
        message: t(
          'events.details.inviteUsers.dialog.notifications.generalError'
        )
      })
    }
  } finally {
    isLoading.value = false
  }
}
// TODO(peter) Remove code duplication
function handleInviteAllCoordinators() {
  $q.dialog({
    title: t(
      'events.details.inviteUsers.dialog.inviteAllCoordinators.dialog.title'
    ),
    message: t(
      'events.details.inviteUsers.dialog.inviteAllCoordinators.dialog.description'
    ),
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
        message: t(
          'events.details.inviteUsers.dialog.inviteAllCoordinators.dialog.notifications.allCoordinatorsAreAlreadyInvited'
        )
      })
    }
  } else {
    $q.notify({
      color: 'info',
      message: t(
        'events.details.inviteUsers.dialog.inviteAllCoordinators.dialog.notifications.noCoordinatorsFound'
      )
    })
  }
}
function handleInviteAllTeamCaptains() {
  $q.dialog({
    title: t(
      'events.details.inviteUsers.dialog.inviteAllTeamcaptains.dialog.title'
    ),
    message: t(
      'events.details.inviteUsers.dialog.inviteAllTeamcaptains.dialog.description'
    ),
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
        message: t(
          'events.details.inviteUsers.dialog.inviteAllTeamcaptains.dialog.notifications.allTeamcaptainsAreAlreadyInvited'
        )
      })
    }
  } else {
    $q.notify({
      color: 'info',
      message: t(
        'events.details.inviteUsers.dialog.inviteAllTeamcaptains.dialog.notifications.noTeamcaptainsFound'
      )
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
      <div class="col-grow qr-and-input">
        <EventQrCodeButton
          v-if="token && eventStore.isCoordinator"
          :url="validateTokenUrl"
          name="Event invitation"
          :small="true"
          image="flag"
          :show-url="false"
          :explanation="
            t('events.invitationToken.explanations.eventInvitation')
          "
        ></EventQrCodeButton>
        <QInput
          use-input
          dense
          v-model="usernameToInvite"
          :placeholder="$t('events.details.inviteUsers.inputPlaceholder')"
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
          <p>{{ $t('events.details.inviteUsers.alreadyInvited') }}:</p>
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
                    :aria-label="
                      $t('events.details.inviteUsers.removeParticipant')
                    "
                  />
                </QIcon>
              </div>
            </QItemSection>
          </QItem>
          <QItem v-if="pendingUsersWithoutVisibleEmailAddresses > 0">
            <QItemSection>
              <QItemLabel>
                {{
                  $t('events.details.inviteUsers.inviteMoreUsersByMail', [
                    pendingUsersWithoutVisibleEmailAddresses
                  ])
                }}
              </QItemLabel>
            </QItemSection>
          </QItem>
        </QList>
        <p v-else>
          {{ $t('events.details.inviteUsers.description') }}
        </p>
      </div>
    </div>
    <div class="row invite-users">
      <QBtn class="full-width" @click="handleInviteAllCoordinators">
        {{
          $t('events.details.inviteUsers.dialog.inviteAllCoordinators.label')
        }}
      </QBtn>
    </div>
    <div class="row invite-users">
      <QBtn class="full-width" @click="handleInviteAllTeamCaptains">
        {{
          $t('events.details.inviteUsers.dialog.inviteAllTeamcaptains.label')
        }}
      </QBtn>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import 'src/css/utils';
@import 'src/css/_variables.scss';
.qr-and-input {
  display: flex;
  margin-bottom: 8px;
  gap: 8px;
}

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
