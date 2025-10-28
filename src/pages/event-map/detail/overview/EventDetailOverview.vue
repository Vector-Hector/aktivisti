<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { EventAreaDto } from 'src/api/model/EventAreaDto'
import { getAuthStore } from 'src/store/AuthStore'
import { useUserStore } from 'src/stores/user'
import EventInvitePeopleModal from 'src/components/modals/EventInvitePeopleModal.vue'
import { apiClient } from 'src/api/ApiClient'
import EventAreaItem from 'src/components/EventAreaItem.vue'
import {
  ionBarChart,
  ionPencil,
  ionPrint,
  ionReceipt,
  ionSettingsSharp,
  ionTrash
} from '@quasar/extras/ionicons-v5'
import {
  QBtn,
  QIcon,
  QFab,
  QFabAction,
  QList,
  QScrollArea,
  useQuasar
} from 'quasar'
import { EventTypes, useEventTypes } from 'src/api/model/EventTypes'
import Share from 'components/Share.vue'
import LabeledBtn from 'components/LabeledBtn.vue'
import { useDeleteEventDialog } from 'src/utils/dialog'
import { useRouter } from 'vue-router'
import { useDateFormat } from 'src/utils/dateFormat'
import { useI18n } from 'vue-i18n'
import { useEventStore } from 'src/stores/event'
import EventParticipationButton from 'src/components/eventDetails/EventParticipationButton.vue'

const { t } = useI18n()
const userStore = useUserStore()

const PREFIX_HANG_DOWN_POSTERS = t('events.details.prefixHangDownPostersEvent')
const pollIntervalMs = 5000
const authStore = getAuthStore()

const $router = useRouter()
const $q = useQuasar()
const { dateFormat } = useDateFormat()
const { eventTypeOptions } = useEventTypes()
const { openDeleteEventDialog } = useDeleteEventDialog()

const joinLoading = ref(false)
const verficationPollTimeout = ref<null | NodeJS.Timeout>(null)
const adminMenuOpen = ref(false)

const eventStore = useEventStore()

function handleParticipationDissmiss() {
  void refreshEvent()
  void eventStore.refreshParticipants()
}

const isVerficationRequired = computed(() => {
  return eventStore.participations.some(
    ({ is_verified, is_team_captain }) => !is_team_captain && !is_verified
  )
})

const shareUrl = computed(() => {
  const shareUrl = process.env.APP_SHARE_URL as string
  return (
    shareUrl +
    $router.resolve({
      name: 'event-detail',
      params: {
        eventId: eventStore.event.id
      }
    }).path
  )
})
const shareTitle = computed(() => {
  return eventStore.event.name
})
const shareDescription = computed(() => {
  if (eventStore.event.description) {
    return `\n\n${eventStore.event.description}`
  } else {
    return ''
  }
})
const shareText = computed(() => {
  const formattedDate = dateFormat(eventStore.event.start_date, 'date')
  const formattedTime = dateFormat(eventStore.event.start_date, 'time')
  return t('events.details.actions.share.shareText', {
    eventName: eventStore.event.name,
    eventType: eventTypeLabel.value,
    eventDescription: shareDescription.value,
    eventDate: formattedDate,
    eventTime: formattedTime
  })
})
const eventId = computed(() => {
  return eventStore.event.id.toString()
})
const noAreaPosters = computed(() => {
  return {
    id: undefined,
    name: t('events.details.noAreaPosters'),
    color: '#FFFFFF',
    event: parseInt(eventId.value),
    is_completed: false,
    poster_count: postersWithoutArea.value.length
  } as Partial<EventAreaDto>
})
const eventAreasSorted = computed(() => {
  const collator = new Intl.Collator('de', { caseFirst: 'upper' })
  return [...eventStore.eventAreas].sort((a, b) => {
    if (a.is_completed && !b.is_completed) {
      return 1
    }
    if (!a.is_completed && b.is_completed) {
      return -1
    }
    return collator.compare(a.name, b.name)
  })
})
const eventTypeLabel = computed(() => {
  return eventTypeOptions.find(({ key }) => key === eventStore.event.event_type)
    ?.label
})
const isLoggedIn = computed(() => {
  return authStore.isLoggedIn()
})
const isMember = computed(() => {
  return eventStore.personalParticipation?.is_pending_invitation === false
})
const isHangDownEvent = computed(() => {
  return eventStore.event.name.startsWith(PREFIX_HANG_DOWN_POSTERS)
})
const isInvited = computed(() => {
  return eventStore.personalParticipation?.is_pending_invitation === true
})
const isPrintableEvent = computed(() => {
  const { event_type } = eventStore.event
  return [
    EventTypes.DOOR_TO_DOOR,
    EventTypes.POSTERS,
    EventTypes.FLYERS
  ].includes(event_type)
})
const needsVerification = computed(() => {
  return (
    eventStore.personalParticipation?.is_verified === false &&
    eventStore.event.event_type !== EventTypes.GENERIC
  )
})

const postersWithoutArea = computed(() =>
  eventStore.posters.filter(({ area }) => area === null)
)

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
  const generalJoinError = t('events.details.notifications.generalJoinError')
  try {
    joinLoading.value = true
    eventStore.event = (await apiClient.events.join(eventId.value)).payload.data
    await updateParticipationAndLoadAreas()
    if (!eventStore.personalParticipation) {
      $q.notify({
        color: 'negative',
        message: generalJoinError
      })
    }
  } catch {
    $q.notify({
      color: 'negative',
      message: generalJoinError
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
  const generalLeaveError = t('events.details.notifications.generalLeaveError')
  try {
    joinLoading.value = true
    eventStore.event = (
      await apiClient.events.leave(eventId.value)
    ).payload.data
    personalParticipation.value = null
  } catch {
    $q.notify({
      color: 'negative',
      message: generalLeaveError
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

function openDeleteModal() {
  openDeleteEventDialog(eventStore.event).catch(console.error)
}
function openAdminMenu() {
  adminMenuOpen.value = true
}
function hideAdminMenu() {
  adminMenuOpen.value = false
}
function openPosterTakeDownModal() {
  $q.dialog({
    title: t('events.details.actions.admin.posterTakeDown.dialog.title'),
    message: t(
      'events.details.actions.admin.posterTakeDown.dialog.description',
      [`<b>"${eventStore.event.name}"</b>`]
    ),
    html: true,
    cancel: true
  })
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    .onOk(async () => {
      const newStartDate = new Date()
      newStartDate.setHours(
        newStartDate.getHours() + Math.round(newStartDate.getMinutes() / 60) + 1
      )
      newStartDate.setMinutes(0, 0, 0)
      const newEndDate = new Date(newStartDate)
      newEndDate.setDate(newEndDate.getDate() + 14)
      try {
        await apiClient.events.update(eventStore.event.id.toString(), {
          ...eventStore.event,
          name: PREFIX_HANG_DOWN_POSTERS + eventStore.event.name,
          start_date: newStartDate.toISOString(),
          end_date: newEndDate.toISOString()
        })
        $router.go(0)
      } catch {
        $q.notify({
          color: 'negative',
          message: t(
            'events.details.actions.admin.posterTakeDown.dialog.notifications.generalError'
          )
        })
      }
    })
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
      <div class="row q-gutter-sm">
        <div class="col">
          <div class="row q-col-gutter-sm event-details">
            <div class="col-4">
              <b>{{ $t('events.details.eventType') }}:</b>
            </div>
            <div class="col-8">
              {{ eventTypeLabel }}
            </div>
            <div class="col-4">
              <b>{{ $t('events.details.meetingPoint') }}:</b>
            </div>
            <div class="col-8">
              {{ eventStore.event.location_description }}
            </div>
            <div class="col-4">
              <b>{{ $t('events.details.startDate') }}:</b>
            </div>
            <div class="col-8">
              {{ dateFormat(eventStore.event.start_date, 'datetime') }}
            </div>
            <div class="col-4">
              <b>{{ $t('events.details.endDate') }}:</b>
            </div>
            <div class="col-8">
              {{ dateFormat(eventStore.event.end_date, 'datetime') }}
            </div>
            <template v-if="eventStore.event.external_url">
              <div class="col-4">
                <b>{{ $t('events.details.externalUrl') }}:</b>
              </div>
              <div class="col-8">
                <a
                  target="_blank"
                  class="primary-link"
                  :href="eventStore.event.external_url"
                  >{{ eventStore.event.external_url }}</a
                >
              </div>
            </template>
            <template v-if="eventStore.event.messenger_url">
              <div class="col-4">
                <b>{{ $t('events.details.messangerUrl') }}:</b>
              </div>
              <div class="col-8">
                <a
                  target="_blank"
                  class="primary-link"
                  :href="eventStore.event.messenger_url"
                  >{{ eventStore.event.messenger_url }}</a
                >
              </div>
            </template>
            <template
              v-if="
                eventStore.isTeamCaptainOrCoordinator &&
                eventStore.event.event_type !== EventTypes.GENERIC
              "
            >
              <div class="col-4">
                <b>{{ $t('events.details.participants') }}:</b>
              </div>
              <div class="col-8">
                {{ eventStore.event.participants }}
              </div>
            </template>
          </div>
        </div>
        <div class="col-auto column">
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
          <Share :title="shareTitle" :text="shareText" :url="shareUrl" />
          <LabeledBtn
            v-if="eventStore.isTeamCaptainOrCoordinator"
            :external-label="$t('events.details.actions.admin.label')"
            class="admin-button"
            :class="{ float: adminMenuOpen }"
          >
            <template v-slot:btn>
              <QFab
                class="bg-white"
                :icon="ionSettingsSharp"
                color="primary"
                padding="sm"
                direction="left"
                outline
                round
                @before-show="openAdminMenu()"
                @before-hide="hideAdminMenu()"
              >
                <QFabAction
                  v-if="eventStore.isCoordinator"
                  @click="openDeleteModal"
                  color="primary"
                  :icon="ionTrash"
                  class="bg-white admin-fab"
                  stacked
                  :label="$t('events.details.actions.admin.delete.label')"
                  outline
                  label-class="bg-grey-2 text-primary"
                  external-label
                  label-position="bottom"
                />
                <QFabAction
                  v-if="eventStore.isCoordinator"
                  :to="{
                    name: 'edit-event-details',
                    params: { eventId: eventStore.event.id }
                  }"
                  color="primary"
                  :icon="ionPencil"
                  class="bg-white admin-fab"
                  stacked
                  :label="$t('events.details.actions.admin.edit.label')"
                  outline
                  label-class="bg-grey-2 text-primary"
                  external-label
                  label-position="bottom"
                />
                <QFabAction
                  v-if="
                    [EventTypes.DOOR_TO_DOOR, EventTypes.FLYERS].includes(
                      eventStore.event.event_type
                    ) && eventStore.isCoordinator
                  "
                  :to="{
                    name: 'event-detail-report',
                    params: { eventId: eventStore.event.id }
                  }"
                  color="primary"
                  :icon="ionBarChart"
                  class="bg-white admin-fab"
                  stacked
                  :label="$t('events.details.actions.admin.report.label')"
                  outline
                  label-class="bg-grey-2 text-primary"
                  external-label
                  label-position="bottom"
                />
                <QFabAction
                  v-if="
                    eventStore.event.event_type === EventTypes.POSTERS &&
                    !isHangDownEvent &&
                    eventStore.isCoordinator
                  "
                  @click="openPosterTakeDownModal"
                  color="primary"
                  :icon="ionReceipt"
                  class="bg-white admin-fab"
                  stacked
                  :label="
                    $t('events.details.actions.admin.posterTakeDown.label')
                  "
                  outline
                  label-class="bg-grey-2 text-primary"
                  external-label
                  label-position="bottom"
                />
                <QFabAction
                  v-if="
                    isPrintableEvent && eventStore.isTeamCaptainOrCoordinator
                  "
                  :to="{
                    name: 'print-event',
                    params: { eventId: eventStore.event.id }
                  }"
                  color="primary"
                  :icon="ionPrint"
                  class="bg-white admin-fab"
                  stacked
                  :label="$t('events.details.actions.admin.print.label')"
                  outline
                  label-class="bg-grey-2 text-primary"
                  external-label
                  label-position="bottom"
                />
              </QFab>
            </template>
          </LabeledBtn>
        </div>
      </div>
      <div class="row">
        <div class="col-12 event-description">
          <b>{{ $t('events.details.publicDescription') }}</b
          ><br />
          {{ eventStore.event.description }}
        </div>
      </div>
      <div v-if="eventStore.event.internal_description" class="row">
        <div class="col-12 event-description">
          <b>{{ $t('events.details.internalDescription') }}</b
          ><br />
          {{ eventStore.event.internal_description }}
        </div>
      </div>
      <div class="areas row q-col-gutter-y-md" v-if="isMember">
        <div class="col-12">
          <QList class="area-list">
            <EventAreaItem
              v-for="area in eventAreasSorted"
              :key="area.id"
              :area="area"
              :participations="eventStore.participations"
              :show-participation-count="eventStore.isTeamCaptainOrCoordinator"
              :personal-participation="eventStore.personalParticipation"
              :event-type="eventStore.event.event_type"
            />
            <EventAreaItem
              v-if="
                eventStore.event.event_type === EventTypes.POSTERS &&
                postersWithoutArea.length > 0
              "
              :area="noAreaPosters"
              :participations="[]"
              :event-type="eventStore.event.event_type"
            />
          </QList>
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

.event-details {
  font-size: 1rem;
}

.event {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.map-container {
  flex: 1;
}

.campaign {
  font-weight: bold;
  display: block;
}

.full-width {
  width: 100%;
}

.event-name {
  margin: 0 0 1rem 0;
}

.event-description {
  font-size: 1rem;
  white-space: pre-line;
  margin-bottom: 1rem;
}

.participants {
  cursor: pointer;
}

label {
  text-align: left;
}

.campaign {
  font-weight: bold;
  display: block;
}

.full-width {
  width: 100%;
}

.event-name {
  margin: 0 0 1rem 0;
}

.chevron {
  margin-left: 2rem;
  font-size: 2rem;
}

.item-buttons {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.social-button {
  background-color: $grey-1;
}

.admin-fab {
  margin-left: 15px !important;
  margin-right: 15px !important;
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
