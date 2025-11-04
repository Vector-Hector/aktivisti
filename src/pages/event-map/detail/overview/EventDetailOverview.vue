<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { getAuthStore } from 'src/store/AuthStore'
import { useUserStore } from 'src/stores/user'
import EventInvitePeopleModal from 'src/components/modals/EventInvitePeopleModal.vue'
import { apiClient } from 'src/api/ApiClient'
import { QBtn, QIcon, QScrollArea, useQuasar } from 'quasar'
import { EventTypes } from 'src/api/model/EventTypes'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useEventStore } from 'src/stores/event'
import EventParticipationButton from 'src/components/eventDetails/EventParticipationButton.vue'
import EventAdminActions from 'src/components/eventDetails/EventAdminActions.vue'
import EventInfos from 'src/components/eventDetails/EventInfos.vue'
import EventShareButton from 'src/components/eventDetails/EventShareButton.vue'
import EventAreasList from 'src/components/eventDetails/EventAreasList.vue'
import { useEventAreaPolling } from './eventAreaPolling'
import QrCodeDownloadable from '../../../../components/QrCodeDownloadable.vue'
import { getShareUrlFromEventId } from 'src/utils/shareUrl'

const { t } = useI18n()
const userStore = useUserStore()

const pollIntervalMs = 5000
const authStore = getAuthStore()

const $router = useRouter()
const $q = useQuasar()

const showQr = ref(false)

const joinLoading = ref(false)
const verficationPollTimeout = ref<null | NodeJS.Timeout>(null)
const adminMenuOpen = ref(false)

const eventStore = useEventStore()

useEventAreaPolling()

function handleParticipationDissmiss() {
  void refreshEvent()
  void eventStore.refreshParticipants()
}

const isVerficationRequired = computed(() => {
  return eventStore.participations.some(
    ({ is_verified, is_team_captain }) => !is_team_captain && !is_verified
  )
})

const eventId = computed(() => {
  return eventStore.event.id.toString()
})
const eventName = computed(() => {
  return eventStore.event.name
})
const shareUrl = getShareUrlFromEventId(eventId.value)
const isLoggedIn = computed(() => {
  return authStore.isLoggedIn()
})
const isMember = computed(() => {
  return eventStore.personalParticipation?.is_pending_invitation === false
})
const isInvited = computed(() => {
  return eventStore.personalParticipation?.is_pending_invitation === true
})
const needsVerification = computed(() => {
  return (
    eventStore.personalParticipation?.is_verified === false &&
    eventStore.event.event_type !== EventTypes.GENERIC
  )
})

watch(
  () => eventStore.personalParticipation?.is_verified,
  (newValue) => {
    if (newValue === false) {
      void pollForVerification()
    } else if (newValue === true && verficationPollTimeout.value !== null) {
      clearTimeout(verficationPollTimeout.value)
    }
  },
  { immediate: true }
)

async function join() {
  try {
    joinLoading.value = true
    eventStore.event = (await apiClient.events.join(eventId.value)).payload.data
    await updateParticipationAndLoadAreas()
    if (!eventStore.personalParticipation) {
      $q.notify({
        color: 'negative',
        message: t('events.details.notifications.generalJoinError')
      })
    }
  } catch {
    $q.notify({
      color: 'negative',
      message: t('events.details.notifications.generalJoinError')
    })
  } finally {
    joinLoading.value = false
  }
}
async function updateParticipationAndLoadAreas() {
  eventStore.setPersonalParticipation(
    (
      await apiClient.eventParticipations.list({
        event: eventId.value,
        user: userStore.user?.id
      })
    ).payload.data?.[0]
  )
  if (
    eventStore.personalParticipation?.is_verified ||
    eventStore.isTeamCaptainOrCoordinator
  ) {
    eventStore.eventAreas = (
      await apiClient.eventAreas.list({ event: eventStore.event.id })
    ).payload.data
    if (eventStore.event.event_type === EventTypes.POSTERS) {
      eventStore.posters = (
        await apiClient.posters.list({
          event: eventStore.event.id,
          include_expired_events: true,
          include_expired_campaigns: true
        })
      ).payload.data
    }
  } else {
    eventStore.eventAreas = []
  }
}
async function leave() {
  try {
    joinLoading.value = true
    eventStore.event = (
      await apiClient.events.leave(eventId.value)
    ).payload.data
    eventStore.personalParticipation = null
  } catch {
    $q.notify({
      color: 'negative',
      message: t('events.details.notifications.generalLeaveError')
    })
  } finally {
    joinLoading.value = false
  }
}
async function acceptInvite() {
  try {
    joinLoading.value = true
    const response = await apiClient.eventParticipations.accept(
      eventStore.personalParticipation!.id.toString()
    )
    eventStore.personalParticipation = response.payload.data
  } catch {
    $q.notify({
      color: 'negative',
      message: t('events.details.notifications.generalJoinError')
    })
  } finally {
    joinLoading.value = false
  }
}
async function refreshEvent() {
  eventStore.event = (await apiClient.events.get(eventId.value)).payload.data
}
function openInviteModal() {
  if (eventStore.isTeamCaptainOrCoordinator) {
    $q.dialog({
      component: EventInvitePeopleModal,
      componentProps: {
        eventId: eventStore.event.id
      }
    }).onDismiss(() => {
      void refreshEvent()
    })
  }
}
async function pollForVerification() {
  if (
    verficationPollTimeout.value !== null ||
    !eventStore.personalParticipation
  ) {
    // polling already started
    return
  }
  if (eventStore.personalParticipation?.is_verified) {
    // if we are finally verified we can stop polling
    return
  }
  await updateParticipationAndLoadAreas()
  verficationPollTimeout.value = setTimeout(() => {
    verficationPollTimeout.value = null
    void pollForVerification()
  }, pollIntervalMs)
}

function openAdminMenu() {
  adminMenuOpen.value = true
}
function hideAdminMenu() {
  adminMenuOpen.value = false
}

function handleClickQr(): void {
  showQr.value = !showQr.value
}

onBeforeUnmount(() => {
  if (verficationPollTimeout.value !== null) {
    clearTimeout(verficationPollTimeout.value)
  }
})
</script>

<template>
  <QScrollArea class="d-flex flex-fill">
    <div class="container q-gutter-y-md q-py-sm">
      <QrCodeDownloadable
        v-if="showQr"
        :name="eventName"
        :url="shareUrl"
      ></QrCodeDownloadable>
      <EventInfos
        :event="eventStore.event"
        :show-particpants="eventStore.isTeamCaptainOrCoordinator"
      >
        <EventParticipationButton
          v-if="
            eventStore.isTeamCaptainOrCoordinator &&
            eventStore.event.event_type !== EventTypes.GENERIC
          "
          :event-id="eventStore.event.id"
          :event-sub-association="eventStore.event.sub_association"
          :has-notification="isVerficationRequired"
          @on-dissmiss="handleParticipationDissmiss"
        />
        <EventShareButton
          :event="eventStore.event"
          @click-qr-code="handleClickQr"
        />
        <EventAdminActions
          v-if="eventStore.isTeamCaptainOrCoordinator"
          :event="eventStore.event"
          :showCoordinatorFeatures="eventStore.isCoordinator"
          @before-show="openAdminMenu()"
          @before-hide="hideAdminMenu()"
          class="admin-button"
          :class="{ float: adminMenuOpen }"
        />
      </EventInfos>
      <div class="areas row q-col-gutter-y-md" v-if="isMember">
        <div class="col-12">
          <EventAreasList
            :eventId="eventStore.event.id"
            :eventAreas="eventStore.eventAreas"
            :eventType="eventStore.event.event_type"
            :personalParticipation="eventStore.personalParticipation"
            :posters="eventStore.posters"
            :showParticipationCount="eventStore.isTeamCaptainOrCoordinator"
            :participations="eventStore.participations"
          />
        </div>
      </div>
      <div v-if="needsVerification" class="row text-primary q-col-gutter-x-md">
        <template v-if="!eventStore.isTeamCaptainOrCoordinator">
          <span class="col-12">
            {{ $t('events.details.infoUserNeedsVerification.description') }}
          </span>
        </template>
      </div>
      <div
        class="row"
        v-if="!isLoggedIn && eventStore.event.event_type !== EventTypes.GENERIC"
      >
        <div class="col-12">
          <QBtn
            :to="{
              name: 'login',
              query: { next: $router.resolve($route).path }
            }"
            color="primary"
            class="full-width"
          >
            {{ $t('events.details.infoUserNeedsToBeLoggedIn') }}
          </QBtn>
        </div>
      </div>
      <div class="row q-col-gutter-x-md" v-if="isLoggedIn">
        <div class="col-6">
          <QBtn
            v-if="eventStore.isTeamCaptainOrCoordinator"
            class="full-width"
            @click="openInviteModal"
            flat
          >
            {{ $t('events.details.inviteUsers.label') }}
          </QBtn>
          <div
            v-if="needsVerification"
            class="text-primary verification-indicator"
          >
            <QIcon
              class="q-mr-sm"
              color="negative"
              size="md"
              name="img:/static/icons/Icon_Waiting.svg"
            >
            </QIcon>
            {{ $t('events.details.infoUserNeedsVerification.iconTitle') }}
          </div>
        </div>
        <div class="col-6">
          <QBtn
            v-if="isMember"
            :disabled="joinLoading"
            color="primary"
            @click="leave"
            class="full-width"
          >
            {{ $t('events.details.leaveButton') }}
          </QBtn>
          <QBtn
            v-else-if="isInvited"
            :disabled="joinLoading"
            @click="acceptInvite"
            color="primary"
            class="full-width"
          >
            {{ $t('events.details.acceptInviteButton') }}
          </QBtn>
          <QBtn
            v-else-if="!isMember"
            class="full-width"
            :disabled="joinLoading"
            @click="join"
            color="primary"
          >
            {{ $t('events.details.joinButton') }}
          </QBtn>
        </div>
      </div>
    </div>
    <div
      class="backdrop"
      :class="{ 'q-dialog__backdrop': adminMenuOpen }"
    ></div>
  </QScrollArea>
</template>

<style lang="scss" scoped>
@import 'src/css/utils.scss';

.full-width {
  width: 100%;
}

label {
  text-align: left;
}

.full-width {
  width: 100%;
}

.verification-indicator {
  font-size: 1rem;
}

.admin-button {
  &.float {
    z-index: 2;
  }
}

.backdrop {
  position: fixed;
  inset: 0;
  z-index: 1;

  &:not(.q-dialog__backdrop) {
    display: none;
  }
}
</style>
