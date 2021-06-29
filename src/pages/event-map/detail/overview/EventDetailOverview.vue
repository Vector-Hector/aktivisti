<template>
  <div class="q-gutter-y-md">
    <div class="row">
      <div class="col-12">
        <QBtn
          v-if="isTeamCaptainOrCoordinator"
          @click="openParticipantsModal"
          size="sm"
          color="primary"
          flat
          :icon="ionPerson"
        />
        <QBtn
          v-if="isCoordinator"
          :to="{ name: 'event-detail-report', params: { event: event.id }}"
          size="sm"
          color="primary"
          flat
          :icon="ionBarChart"
        />
        <QBtn
          v-if="isCoordinator"
          :to="{name: 'edit-event-details', params: { event: event.id }}"
          size="sm"
          color="primary"
          flat
          :icon="ionPencil"
        />
        <QBtn
          v-if="isCoordinator"
          @click="openDeleteModal"
          size="sm"
          color="primary"
          flat
          :icon="ionTrash"
        />
      </div>
    </div>
    <div class="row q-col-gutter-y-sm">
      <div class="col-2">
        Start:
      </div>
      <div class="col-10">
        {{ new Date(event.start_date).toLocaleString([], dateOptions) }}
      </div>
      <div class="col-2">
        Ende:
      </div>
      <div class="col-10">
        {{ event.end_date ? new Date(event.end_date).toLocaleString([], dateOptions) : 'Nicht definiert' }}
      </div>
      <div class="col-12">
      <span
        v-if="isTeamCaptain"
        class="participants"
        @click="openParticipantsModal"
      >
          <QIcon :name="ionPersonOutline" /> {{ event.participants }}/{{ event.max_participants ?? '∞' }}
        </span>
      </div>
      <div class="col-12">
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
            :show-participation-count="isTeamCaptain ?? false"
            :personal-participation="personalParticipation"
          />
        </QList>
      </div>
    </div>
    <div class="social-buttons row q-gutter-x-md" v-if="event">
      <QBtn
        dense
        type="a"
        target="_blank"
        :href="twitterShareUrl"
        size="sm"
        class="social-button"
        label="teilen"
        :icon="ionLogoTwitter"
      />
      <QBtn
        dense
        type="a"
        target="_blank"
        :href="facebookShareUrl"
        size="sm"
        class="social-button"
        label="teilen"
        :icon="ionLogoFacebook"
      />
      <QBtn
        dense
        type="a"
        target="_blank"
        :href="whatsappShareUrl"
        size="sm"
        class="social-button"
        label="teilen"
        :icon="ionLogoWhatsapp"
      />
      <QBtn
        dense
        type="a"
        target="_blank"
        :href="mailShareUrl"
        size="sm"
        class="social-button"
        label="teilen"
        :icon="ionMail"
      />
    </div>
    <div
      v-if="personalParticipation?.is_verified === false"
      class="row"
    >
      <div class="col-12">
        Super, dass du mitmachen möchtest. Du hast dich für diese Aktion gemeldet. Der nächste Schritt ist zur
        angegebenen
        Zeit am vereinbarten Treffpunkt zu erscheinen. Ein Teamcaptain wird dich dann für diese Aktion freischalten.
      </div>
    </div>
    <div
      class="row"
      v-if="!isLoggedIn"
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
      v-else
    >
      <div class="col-6">
        <QBtn
          v-if="isTeamCaptain"
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
          flat
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
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { EventAreaDto } from 'src/api/model/EventAreaDto'
import { authStore } from 'src/store/AuthStore'
import { userStore } from 'src/store/UserStore'
import EventInvitePeopleModal from 'src/components/modals/EventInvitePeopleModal.vue'
import EventParticipantsModal from 'src/components/modals/EventParticipantsModal.vue'
import { apiClient } from 'src/api/ApiClient'
import {
  createFacebookShareUrl,
  createMailShareUrl,
  createTwitterShareUrl,
  createWhatsappShareUrl
} from 'src/utils/shareLinks'
import EventAreaItem from 'src/components/EventAreaItem.vue'
import EventDetailMixin from 'pages/event-map/detail/EventDetailStoreMixin'
import {
  ionBarChart,
  ionLogoFacebook,
  ionLogoTwitter,
  ionLogoWhatsapp,
  ionMail,
  ionPencil,
  ionTrash,
  ionPerson,
  ionPersonOutline
} from '@quasar/extras/ionicons-v5'
import { QBtn, QIcon, QList } from 'quasar'
import { BottomSheetState, uiStore } from 'src/store/UiStore'


export default defineComponent({
  name: 'EventDetailOverview',
  mixins: [EventDetailMixin],
  components: {
    EventAreaItem,
    QBtn,
    QIcon,
    QList
  },
  props: {
    id: {
      type: String as PropType<string>,
      required: true
    }
  },
  beforeRouteEnter(from, to, next) {
    uiStore.setBottomSheetStateAtLeast(BottomSheetState.HALF)
    next()
  },
  inject: ['scrollArea'],
  data() {
    return {
      loading: true,
      joinLoading: false,
      dateOptions: {
        year: 'numeric',
        month: '2-digit',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      },
      ionLogoFacebook,
      ionLogoTwitter,
      ionLogoWhatsapp,
      ionMail,
      ionBarChart,
      ionPencil,
      ionPersonOutline,
      ionPerson,
      ionTrash
    }
  },
  computed: {
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
    isLoggedIn(): boolean {
      return authStore.isLoggedIn()
    },
    isMember(): boolean {
      return this.personalParticipation?.is_pending_invitation === false
    },
    isInvited(): boolean {
      return this.personalParticipation?.is_pending_invitation === true
    },
    isCampaignAdmin(): boolean {
      return userStore.isCampaignAdmin()
    },
    twitterShareUrl(): string {
      return createTwitterShareUrl(
        `${window.location.origin}${this.$router.resolve({
          name: 'event-detail',
          params: {
            id: this.event.id
          }
        }).path}`,
        [],
        this.event
      )
    },
    facebookShareUrl(): string {
      return createFacebookShareUrl(
        window.location.origin + this.$router.resolve({
          name: 'event-detail',
          params: {
            id: this.event.id
          }
        }).path
      )
    },
    mailShareUrl(): string {
      return createMailShareUrl(
        window.location.origin + this.$router.resolve({
          name: 'event-detail',
          params: {
            id: this.event.id
          }
        }).path,
        this.event
      )
    },
    whatsappShareUrl(): string {
      return createWhatsappShareUrl(
        window.location.origin + this.$router.resolve({
          name: 'event-detail',
          params: {
            id: this.event.id
          }
        }).path,
        this.event
      )
    }
  },
  methods: {
    async join() {
      const generalJoinError = 'Ein unerwarteter Fehler trat auf beim versuch der Aktion beizutreten'
      try {
        this.joinLoading = true
        this.event = (await this.$apiClient.events.join(this.id)).payload.data
        this.personalParticipation = (await this.$apiClient.eventParticipations.list({
          event: this.id,
          user: userStore.getState().user?.id
        })).payload.data?.[0]
        if (this.personalParticipation?.is_verified) {
          this.eventAreas = (await this.$apiClient.eventAreas.list({event: this.event.id})).payload.data
        } else {
          this.eventAreas = []
        }
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
    async leave() {
      const generalLeaveError = 'Ein unerwarteter Fehler trat auf beim versuch die Aktion zu verlassen'
      try {
        this.joinLoading = true
        this.event = (await this.$apiClient.events.leave(this.id)).payload.data
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
      this.event = (await apiClient.events.get(this.id)).payload.data
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
    openParticipantsModal() {
      this.$q.dialog({
        component: EventParticipantsModal,
        maximized: true,
        componentProps: {
          eventId: this.event.id
        }
      })
        .onDismiss(() => {
          void this.refreshEvent()
        })
    },
    openDeleteModal() {
      this.$q.dialog({
        title: `${this.event.name} wirklich löschen?`,
        message: `Das Event <b>"${this.event.name}"</b> wird gelöscht und kann nicht wiederhergestellt werden.`,
        html: true,
        cancel: true
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
    }
  }
})

</script>

<style lang="scss" scoped>
@import "src/css/_globals.scss";
@import "src/css/_utils.scss";

label {
  text-align: left;
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
  background-color: $gray-200;
}


</style>
