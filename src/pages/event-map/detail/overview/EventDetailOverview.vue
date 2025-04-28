<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { EventAreaDto } from 'src/api/model/EventAreaDto'
import { getAuthStore } from 'src/store/AuthStore'
import { userStore } from 'src/store/UserStore'
import EventInvitePeopleModal from 'src/components/modals/EventInvitePeopleModal.vue'
import EventParticipantsModal from 'src/components/modals/EventParticipantsModal.vue'
import { apiClient } from 'src/api/ApiClient'
import EventAreaItem from 'src/components/EventAreaItem.vue'
import {
  ionBarChart,
  ionPencil,
  ionPerson,
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
import { openDeleteEventDialog } from 'src/utils/dialog'
import { useEventDetailStore } from 'pages/event-map/detail/EventDetailStoreMixin'
import { useRouter } from 'vue-router'
import { useDateFormat } from 'src/utils/dateFormat'

const PREFIX_HANG_DOWN_POSTERS = '[Abhängen] '
const pollIntervalMs = 5000
const authStore = getAuthStore()

const $router = useRouter()
const $q = useQuasar()
const { dateFormat } = useDateFormat()
const { eventTypeOptions } = useEventTypes()

const joinLoading = ref(false)
const verficationPollTimeout = ref<null | NodeJS.Timeout>(null)
const adminMenuOpen = ref(false)

const {
  event,
  eventAreas,
  isTeamCaptainOrCoordinator,
  isCoordinator,
  participations,
  personalParticipation,
  postersWithoutArea,
  posters,
  refreshParticipants
} = useEventDetailStore()

const isVerficationRequired = computed(() => {
  return participations.value.some(
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
        eventId: event.value.id
      }
    }).path
  )
})
const shareTitle = computed(() => {
  return event.value.name
})
const shareDescription = computed(() => {
  if (event.value.description) {
    return `\n\n${event.value.description}`
  } else {
    return ''
  }
})
const shareText = computed(() => {
  const formattedDate = dateFormat(event.value.start_date, 'date')
  const formattedTime = dateFormat(event.value.start_date, 'time')
  return `${event.value.name}\n${eventTypeLabel.value}${shareDescription.value}\n\nam: ${formattedDate}\num: ${formattedTime}\n`
})
const eventId = computed(() => {
  return event.value.id.toString()
})
const noAreaPosters = computed(() => {
  return {
    id: undefined,
    name: 'Ohne Gebiet',
    color: '#FFFFFF',
    event: parseInt(eventId.value),
    is_completed: false,
    poster_count: postersWithoutArea.value.length
  } as Partial<EventAreaDto>
})
const eventAreasSorted = computed(() => {
  const collator = new Intl.Collator('de', { caseFirst: 'upper' })
  return [...eventAreas.value].sort((a, b) => {
    if (a.is_completed) {
      return 1
    } else {
      return collator.compare(a.name, b.name)
    }
  })
})
const eventTypeLabel = computed(() => {
  return eventTypeOptions.find(({ key }) => key === event.value.event_type)
    ?.label
})
const isLoggedIn = computed(() => {
  return authStore.isLoggedIn()
})
const isMember = computed(() => {
  return personalParticipation.value?.is_pending_invitation === false
})
const isHangDownEvent = computed(() => {
  return event.value.name.startsWith(PREFIX_HANG_DOWN_POSTERS)
})
const isInvited = computed(() => {
  return personalParticipation.value?.is_pending_invitation === true
})
const isPrintableEvent = computed(() => {
  const { event_type } = event.value
  return [
    EventTypes.DOOR_TO_DOOR,
    EventTypes.POSTERS,
    EventTypes.FLYERS
  ].includes(event_type)
})
const needsVerification = computed(() => {
  return (
    personalParticipation.value?.is_verified === false &&
    event.value.event_type !== EventTypes.GENERIC
  )
})

watch(
  () => personalParticipation.value?.is_verified,
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
  const generalJoinError =
    'Ein unerwarteter Fehler trat auf beim versuch der Aktion beizutreten'
  try {
    joinLoading.value = true
    event.value = (await apiClient.events.join(eventId.value)).payload.data
    await updateParticipationAndLoadAreas()
    if (!personalParticipation.value) {
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
  personalParticipation.value = (
    await apiClient.eventParticipations.list({
      event: eventId.value,
      user: userStore.getState().user?.id
    })
  ).payload.data?.[0]
  if (
    personalParticipation.value?.is_verified ||
    isTeamCaptainOrCoordinator.value
  ) {
    eventAreas.value = (
      await apiClient.eventAreas.list({ event: event.value.id })
    ).payload.data
    if (event.value.event_type === EventTypes.POSTERS) {
      posters.value = (
        await apiClient.posters.list({
          event: event.value.id,
          include_expired_events: true,
          include_expired_campaigns: true
        })
      ).payload.data
    }
  } else {
    eventAreas.value = []
  }
}
async function leave() {
  const generalLeaveError =
    'Ein unerwarteter Fehler trat auf beim versuch die Aktion zu verlassen'
  try {
    joinLoading.value = true
    event.value = (await apiClient.events.leave(eventId.value)).payload.data
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
      personalParticipation.value!.id.toString()
    )
    personalParticipation.value = response.payload.data
  } catch {
    $q.notify({
      color: 'negative',
      message:
        'Ein unerwarteter Fehler trat auf beim versuch der Aktion beizutreten'
    })
  } finally {
    joinLoading.value = false
  }
}
async function refreshEvent() {
  event.value = (await apiClient.events.get(eventId.value)).payload.data
}
function openInviteModal() {
  if (isTeamCaptainOrCoordinator.value) {
    $q.dialog({
      component: EventInvitePeopleModal,
      componentProps: {
        eventId: event.value.id
      }
    }).onDismiss(() => {
      void refreshEvent()
    })
  }
}
async function pollForVerification() {
  if (verficationPollTimeout.value !== null || !personalParticipation) {
    // polling already started
    return
  }
  if (personalParticipation.value?.is_verified) {
    // if we are finally verified we can stop polling
    return
  }
  await updateParticipationAndLoadAreas()
  verficationPollTimeout.value = setTimeout(() => {
    verficationPollTimeout.value = null
    void pollForVerification()
  }, pollIntervalMs)
}
function openParticipantsModal() {
  $q.dialog({
    component: EventParticipantsModal,
    maximized: true,
    componentProps: {
      eventId: event.value.id,
      eventSubAssociation: event.value.sub_association
    }
  }).onDismiss(() => {
    void refreshEvent()
    void refreshParticipants()
  })
}
function openDeleteModal() {
  openDeleteEventDialog($q, event.value).catch(console.error)
}
function openAdminMenu() {
  adminMenuOpen.value = true
}
function hideAdminMenu() {
  adminMenuOpen.value = false
}
function openPosterTakeDownModal() {
  $q.dialog({
    title: 'Willst Du Plakate abhängen?',
    message: `Das Event <b>"${event.value.name}"</b> wird in eine Aktion zum Abhängen von Plakaten umgewandelt.`,
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
        await apiClient.events.update(event.value.id.toString(), {
          ...event.value,
          name: PREFIX_HANG_DOWN_POSTERS + event.value.name,
          start_date: newStartDate.toISOString(),
          end_date: newEndDate.toISOString()
        })
        $router.go(0)
      } catch {
        $q.notify({
          color: 'negative',
          message:
            'Die Aktion konnte nicht in eine Plakate-Abhängaktion umgewandelt werden'
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
              <b>Aktionstyp:</b>
            </div>
            <div class="col-8">
              {{ eventTypeLabel }}
            </div>
            <div class="col-4">
              <b>Treffpunkt:</b>
            </div>
            <div class="col-8">
              {{ event.location_description }}
            </div>
            <div class="col-4">
              <b>Start:</b>
            </div>
            <div class="col-8">
              {{ dateFormat(event.start_date, 'datetime') }}
            </div>
            <div class="col-4">
              <b>Ende:</b>
            </div>
            <div class="col-8">
              {{ dateFormat(event.end_date, 'datetime') }}
            </div>
            <template v-if="event.external_url">
              <div class="col-4"><b>Link:</b></div>
              <div class="col-8">
                <a
                  target="_blank"
                  class="primary-link"
                  :href="event.external_url"
                  >{{ event.external_url }}</a
                >
              </div>
            </template>
            <template v-if="event.messenger_url">
              <div class="col-4"><b>Messenger:</b></div>
              <div class="col-8">
                <a
                  target="_blank"
                  class="primary-link"
                  :href="event.messenger_url"
                  >{{ event.messenger_url }}</a
                >
              </div>
            </template>
            <template
              v-if="
                isTeamCaptainOrCoordinator &&
                event.event_type !== EventTypes.GENERIC
              "
            >
              <div class="col-4">
                <b>Teilnahmen:</b>
              </div>
              <div class="col-8">
                {{ event.participants }}
              </div>
            </template>
          </div>
        </div>
        <div class="col-auto column">
          <LabeledBtn
            v-if="
              isTeamCaptainOrCoordinator &&
              event.event_type !== EventTypes.GENERIC
            "
            round
            outline
            :icon="ionPerson"
            @click="openParticipantsModal"
            external-label="Teilnahmen"
            :has-notification="isVerficationRequired"
          />
          <Share :title="shareTitle" :text="shareText" :url="shareUrl" />
          <LabeledBtn
            v-if="isTeamCaptainOrCoordinator"
            external-label="Admin"
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
                  v-if="isCoordinator"
                  @click="openDeleteModal"
                  color="primary"
                  :icon="ionTrash"
                  class="bg-white admin-fab"
                  stacked
                  label="Löschen"
                  outline
                  label-class="bg-grey-2 text-primary"
                  external-label
                  label-position="bottom"
                />
                <QFabAction
                  v-if="isCoordinator"
                  :to="{
                    name: 'edit-event-details',
                    params: { eventId: event.id }
                  }"
                  color="primary"
                  :icon="ionPencil"
                  class="bg-white admin-fab"
                  stacked
                  label="Bearbeiten"
                  outline
                  label-class="bg-grey-2 text-primary"
                  external-label
                  label-position="bottom"
                />
                <QFabAction
                  v-if="
                    [EventTypes.DOOR_TO_DOOR, EventTypes.FLYERS].includes(
                      event.event_type
                    ) && isCoordinator
                  "
                  :to="{
                    name: 'event-detail-report',
                    params: { eventId: event.id }
                  }"
                  color="primary"
                  :icon="ionBarChart"
                  class="bg-white admin-fab"
                  stacked
                  label="Report"
                  outline
                  label-class="bg-grey-2 text-primary"
                  external-label
                  label-position="bottom"
                />
                <QFabAction
                  v-if="
                    event.event_type === EventTypes.POSTERS &&
                    !isHangDownEvent &&
                    isCoordinator
                  "
                  @click="openPosterTakeDownModal"
                  color="primary"
                  :icon="ionReceipt"
                  class="bg-white admin-fab"
                  stacked
                  label="Abhängen"
                  outline
                  label-class="bg-grey-2 text-primary"
                  external-label
                  label-position="bottom"
                />
                <QFabAction
                  v-if="isPrintableEvent && isTeamCaptainOrCoordinator"
                  :to="{ name: 'print-event', params: { eventId: event.id } }"
                  color="primary"
                  :icon="ionPrint"
                  class="bg-white admin-fab"
                  stacked
                  label="Drucken"
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
          <b>Öffentliche Beschreibung</b><br />
          {{ event.description }}
        </div>
      </div>
      <div v-if="event.internal_description" class="row">
        <div class="col-12 event-description">
          <b>Interne Informationen</b><br />
          {{ event.internal_description }}
        </div>
      </div>
      <div class="areas row q-col-gutter-y-md" v-if="isMember">
        <div class="col-12">
          <QList class="area-list">
            <EventAreaItem
              v-for="area in eventAreasSorted"
              :key="area.id"
              :area="area"
              :participations="participations"
              :show-participation-count="isTeamCaptainOrCoordinator"
              :personal-participation="personalParticipation"
              :event-type="event.event_type"
            />
            <EventAreaItem
              v-if="
                event.event_type === EventTypes.POSTERS &&
                postersWithoutArea.length > 0
              "
              :area="noAreaPosters"
              :participations="[]"
              :event-type="event.event_type"
            />
          </QList>
        </div>
      </div>
      <div v-if="needsVerification" class="row text-primary q-col-gutter-x-md">
        <template v-if="!isTeamCaptainOrCoordinator">
          <span class="col-12">
            Super, dass du mitmachen möchtest. Du hast dich für diese Aktion
            gemeldet. Der nächste Schritt ist zur angegebenen Zeit am
            vereinbarten Treffpunkt zu erscheinen. Ein Teamcaptain wird dich
            dann für diese Aktion freischalten.
          </span>
        </template>
      </div>
      <div
        class="row"
        v-if="!isLoggedIn && event.event_type !== EventTypes.GENERIC"
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
            Anmelden um mitzumachen
          </QBtn>
        </div>
      </div>
      <div class="row q-col-gutter-x-md" v-if="isLoggedIn">
        <div class="col-6">
          <QBtn
            v-if="isTeamCaptainOrCoordinator"
            class="full-width"
            @click="openInviteModal"
            flat
          >
            Leute einladen
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
              aria-label="Fehlerindikator für Gebiet"
            >
            </QIcon>
            Freischaltung
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
            Doch nicht dabei
          </QBtn>
          <QBtn
            v-else-if="isInvited"
            :disabled="joinLoading"
            @click="acceptInvite"
            color="primary"
            class="full-width"
          >
            Einladung annehmen
          </QBtn>
          <QBtn
            v-else-if="!isMember"
            class="full-width"
            :disabled="joinLoading"
            @click="join"
            color="primary"
          >
            Ich bin dabei
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
