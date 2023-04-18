<template>
  <QScrollArea
    class="d-flex flex-fill"
  >
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
              {{ new Date(event.start_date).toLocaleString([], dateOptions) }}
            </div>
            <div class="col-4">
              <b>Ende:</b>
            </div>
            <div class="col-8">
              {{ event.end_date ? new Date(event.end_date).toLocaleString([], dateOptions) : 'Nicht definiert' }}
            </div>
            <template v-if="event.external_url">
              <div class="col-4">
                Link:
              </div>
              <div class="col-8">
                <a target="_blank" class="primary-link" :href="event.external_url">{{ event.external_url }}</a>
              </div>
            </template>
            <template
              v-if="isTeamCaptainOrCoordinator && event.event_type !== EventTypes.GENERIC"
            >
              <div class="col-4">
                <b>Teilnahmen:</b>
              </div>
              <div class="col-8">
                {{ event.participants }} von max. {{ event.max_participants ?? '∞' }}
              </div>
            </template>
          </div>
        </div>
        <div class="col-auto column">
          <LabeledBtn
            v-if="
              isPrintableEvent &&
              (personalParticipation?.is_verified || isTeamCaptainOrCoordinator)
            "
            round
            outline
            :icon="ionPrint"
            :to="{ name: 'print-event', params: {eventId: event.id}}"
            external-label="Drucken"
          />
          <Share
            :title="shareTitle"
            :text="shareText"
            :url="shareUrl"
          />
          <LabeledBtn
            v-if="isTeamCaptainOrCoordinator"
            external-label="Admin"
          >
            <template v-slot:btn>
              <QFab
                :icon="ionSettingsSharp"
                color="primary"
                padding="sm"
                direction="left"
                outline
                round
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
                  :to="{name: 'edit-event-details', params: { eventId: event.id }}"
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
                    [EventTypes.DOOR_TO_DOOR, EventTypes.FLYERS].includes(event.event_type) &&
                    isCoordinator
                  "
                  :to="{ name: 'event-detail-report', params: { eventId: event.id }}"
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
                  v-if="event.event_type === EventTypes.POSTERS && !isHangDownEvent && isCoordinator"
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
                  v-if="isTeamCaptainOrCoordinator && event.event_type !== EventTypes.GENERIC"
                  @click="openParticipantsModal"
                  color="primary"
                  :icon="ionPerson"
                  class="bg-white admin-fab"
                  stacked
                  label="Teilnahmen"
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
          <b>Beschreibung</b><br>
          {{ event.description }}
        </div>
      </div>
      <div
        class="areas row q-col-gutter-y-md"
        v-if="isMember"
      >
        <div class="col-12">
          <QList
            class="area-list"
          >
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
              v-if="event.event_type === EventTypes.POSTERS && postersWithoutArea.length > 0"
              :area="noAreaPosters"
              :participations="[]"
              :event-type="event.event_type"
            />
          </QList>
        </div>
      </div>
      <div
        v-if="personalParticipation?.is_verified === false && event.event_type !== EventTypes.GENERIC"
        class="row"
      >
        <div v-if="!isTeamCaptainOrCoordinator" class="col-12">
          Super, dass du mitmachen möchtest. Du hast dich für diese Aktion gemeldet. Der nächste Schritt ist zur
          angegebenen
          Zeit am vereinbarten Treffpunkt zu erscheinen. Ein Teamcaptain wird dich dann für diese Aktion freischalten.
        </div>
      </div>
      <div
        class="row"
        v-if="!isLoggedIn && event.event_type !== EventTypes.GENERIC"
      >
        <div class="col-12">
          <QBtn
            :to="{ name: 'login', query: {next: $router.resolve($route).path } }"
            color="primary"
            class="full-width"
          >
            Anmelden um mitzumachen
          </QBtn>
        </div>
      </div>
      <div
        class="row q-col-gutter-x-md"
        v-if="isLoggedIn"
      >
        <div class="col-6">
          <QBtn
            v-if="isTeamCaptainOrCoordinator"
            class="full-width"
            @click="openInviteModal"
            flat
          >
            Leute einladen
          </QBtn>
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
  </QScrollArea>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { EventAreaDto } from 'src/api/model/EventAreaDto'
import { getAuthStore } from 'src/store/AuthStore'
import { userStore } from 'src/store/UserStore'
import EventInvitePeopleModal from 'src/components/modals/EventInvitePeopleModal.vue'
import EventParticipantsModal from 'src/components/modals/EventParticipantsModal.vue'
import { apiClient } from 'src/api/ApiClient'
import EventAreaItem from 'src/components/EventAreaItem.vue'
import EventDetailMixin from 'pages/event-map/detail/EventDetailStoreMixin'
import {
  ionBarChart,
  ionLogoFacebook,
  ionLogoTwitter,
  ionLogoWhatsapp,
  ionMail,
  ionPencil,
  ionPerson,
  ionPersonOutline,
  ionPrint,
  ionReceipt,
  ionSettingsSharp,
  ionTrash
} from '@quasar/extras/ionicons-v5'
import { QBtn, QFab, QFabAction, QList, QScrollArea } from 'quasar'
import { eventTypeOptions, EventTypes } from 'src/api/model/EventTypes'
import Share from 'components/Share.vue'
import LabeledBtn from 'components/LabeledBtn.vue'

const PREFIX_HANG_DOWN_POSTERS = '[Abhängen] '
const pollIntervalMs = 5000
const authStore = getAuthStore()

export default defineComponent({
  name: 'EventDetailOverview',
  mixins: [EventDetailMixin],
  components: {
    LabeledBtn,
    Share,
    EventAreaItem,
    QScrollArea,
    QBtn,
    QList,
    QFab,
    QFabAction
  },
  beforeRouteEnter(from, to, next) {
    next()
  },
  inject: ['scrollArea'],
  data() {
    return {
      ionSettingsSharp,
      loading: true,
      joinLoading: false,
      dateOptions: {
        year: 'numeric',
        month: '2-digit',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      },
      verficationPollTimeout: null as null | NodeJS.Timeout,
      EventTypes,
      ionPrint,
      ionLogoFacebook,
      ionLogoTwitter,
      ionLogoWhatsapp,
      ionMail,
      ionBarChart,
      ionPencil,
      ionPersonOutline,
      ionPerson,
      ionReceipt,
      ionTrash
    }
  },
  watch: {
    'personalParticipation.is_verified': {
      handler(newValue) {
        if (newValue === false) {
          void this.pollForVerification()
        } else if (newValue === true && this.verficationPollTimeout !== null) {
          clearTimeout(this.verficationPollTimeout)
        }
      },
      immediate: true
    }
  },
  computed: {
    shareUrl(): string {
      const shareUrl = process.env.APP_SHARE_URL as string
      return shareUrl + this.$router.resolve({
        name: 'event-detail',
        params: {
          eventId: this.event.id
        }
      }).path
    },
    shareTitle(): string {
      return this.event.name
    },
    shareText(): string {
      const formattedDate = new Date(this.event.start_date).toLocaleString([], {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
      return `${this.event.name}\n${formattedDate}\n\n${this.event.description}`
    },
    eventId(): string {
      return this.event.id.toString()
    },
    noAreaPosters(): Partial<EventAreaDto> {
      return {
        id: undefined,
        name: 'Ohne Gebiet',
        color: '#FFFFFF',
        event: parseInt(this.eventId),
        is_completed: false,
        poster_count: this.postersWithoutArea.length
      } as Partial<EventAreaDto>
    },
    eventAreasSorted(): EventAreaDto[] {
      const collator = new Intl.Collator('de', {caseFirst: 'upper'})
      return [...this.eventAreas].sort((a, b) => {
        if (a.is_completed) {
          return 1
        } else {
          return collator.compare(a.name, b.name)
        }
      })
    },
    eventTypeLabel(): string | undefined {
      return eventTypeOptions.find(({key}) => key === this.event.event_type)?.label
    },
    isLoggedIn(): boolean {
      return authStore.isLoggedIn()
    },
    isMember(): boolean {
      return this.personalParticipation?.is_pending_invitation === false
    },
    isHangDownEvent(): boolean {
      return this.event.name.startsWith(PREFIX_HANG_DOWN_POSTERS)
    },
    isInvited(): boolean {
      return this.personalParticipation?.is_pending_invitation === true
    },
    isCampaignAdmin(): boolean {
      return userStore.isCampaignAdmin()
    },
    isPrintableEvent(): boolean {
      const {event_type} = this.event
      return [EventTypes.DOOR_TO_DOOR, EventTypes.POSTERS, EventTypes.FLYERS].includes(event_type)
    }
  },
  methods: {
    async join() {
      const generalJoinError = 'Ein unerwarteter Fehler trat auf beim versuch der Aktion beizutreten'
      try {
        this.joinLoading = true
        this.event = (await this.$apiClient.events.join(this.eventId)).payload.data
        await this.updateParticipationAndLoadAreas()
        if (!this.personalParticipation) {
          this.$q.notify({
            color: 'negative',
            message: generalJoinError
          })
        }
      } catch (e) {
        this.$q.notify({
          color: 'negative',
          message: generalJoinError
        })
      } finally {
        this.joinLoading = false
      }
      setTimeout(() => {
        // @ts-ignore
        this.scrollArea?.value?.setScrollPercentage('vertical', 1, 300)
      }, 300)
    },
    async updateParticipationAndLoadAreas() {
      this.personalParticipation = (await this.$apiClient.eventParticipations.list({
        event: this.eventId,
        user: userStore.getState().user?.id
      })).payload.data?.[0]
      if (this.personalParticipation?.is_verified || this.isTeamCaptainOrCoordinator) {
        this.eventAreas = (await this.$apiClient.eventAreas.list({event: this.event.id})).payload.data
        if (this.event.event_type === EventTypes.POSTERS) {
          this.posters = (await this.$apiClient.posters.list({event: this.event.id})).payload.data
        }
      } else {
        this.eventAreas = []
      }
    },
    async leave() {
      const generalLeaveError = 'Ein unerwarteter Fehler trat auf beim versuch die Aktion zu verlassen'
      try {
        this.joinLoading = true
        this.event = (await this.$apiClient.events.leave(this.eventId)).payload.data
        this.personalParticipation = null
      } catch (e) {
        this.$q.notify({
          color: 'negative',
          message: generalLeaveError
        })
      } finally {
        this.joinLoading = false
      }
    },
    async acceptInvite() {
      try {
        this.joinLoading = true
        const response = await this.$apiClient.eventParticipations.accept(this.personalParticipation!.id.toString())
        this.personalParticipation = response.payload.data
      } catch (e) {
        this.$q.notify({
          color: 'negative',
          message: 'Ein unerwarteter Fehler trat auf beim versuch der Aktion beizutreten'
        })
      } finally {
        this.joinLoading = false
      }
    },
    async refreshEvent() {
      this.event = (await apiClient.events.get(this.eventId)).payload.data
    },
    openInviteModal() {
      if (this.isTeamCaptainOrCoordinator) {
        this.$q.dialog({
          component: EventInvitePeopleModal,
          componentProps: {
            eventId: this.event.id
          }
        })
          .onDismiss(() => {
            void this.refreshEvent()
          })
      }
    },
    async pollForVerification() {
      if (this.verficationPollTimeout !== null || !this.personalParticipation) {
        // polling already started
        return
      }
      if (this.personalParticipation?.is_verified) {
        // if we are finally verified we can stop polling
        return
      }
      await this.updateParticipationAndLoadAreas()
      this.verficationPollTimeout = setTimeout(() => {
        this.verficationPollTimeout = null
        void this.pollForVerification()
      }, pollIntervalMs)
    },
    openParticipantsModal() {
      this.$q.dialog({
        component: EventParticipantsModal,
        maximized: true,
        componentProps: {
          eventId: this.event.id,
          eventSubAssociation: this.event.sub_association
        }
      })
        .onDismiss(() => {
          void this.refreshEvent()
          void this.refreshParticipants()
        })
    },
    openDeleteModal() {
      this.$q.dialog({
        title: `${this.event.name} wirklich löschen?`,
        message: `Das Event <b>"${this.event.name}"</b> wird gelöscht und kann nicht wiederhergestellt werden.`,
        html: true,
        cancel: true
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
      }).onOk(async () => {
        try {
          await this.$apiClient.events.delete(this.event.id.toString())
          await this.$router.push({name: 'events'})
        } catch (error) {
          this.$q.notify({
            color: 'negative',
            message: 'Die Aktion konnte nicht gelöscht werden.'
          })
          return
        }
      })
    },
    openPosterTakeDownModal() {
      this.$q.dialog({
        title: 'Willst Du Plakate abhängen?',
        message: `Das Event <b>"${this.event.name}"</b> wird in eine Aktion zum Abhängen von Plakaten umgewandelt.`,
        html: true,
        cancel: true
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
      }).onOk(async () => {
        const newStartDate = new Date()
        newStartDate.setHours(newStartDate.getHours() + Math.round(newStartDate.getMinutes() / 60) + 1)
        newStartDate.setMinutes(0, 0, 0)
        const newEndDate = new Date(newStartDate)
        newEndDate.setDate(newEndDate.getDate() + 14)
        try {
          await this.$apiClient.events.update(this.event.id.toString(), {
            ...this.event,
            name: PREFIX_HANG_DOWN_POSTERS + this.event.name,
            start_date: newStartDate.toISOString(),
            end_date: newEndDate.toISOString()
          })
          this.$router.go(0)
        } catch (error) {
          this.$q.notify({
            color: 'negative',
            message: 'Die Aktion konnte nicht in eine Plakate-Abhängaktion umgewandelt werden'
          })
          return
        }
      })

    }
  },
  beforeUnmount() {
    if (this.verficationPollTimeout !== null) {
      clearTimeout(this.verficationPollTimeout)
    }
  }
})

</script>

<style lang="scss" scoped>
@import "src/css/utils.scss";

.event-details {
  font-size: 1rem;
}

.event {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.map-container {
  flex: 1
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
  margin-left: 20px !important;
  margin-right: 20px !important;
}
</style>
