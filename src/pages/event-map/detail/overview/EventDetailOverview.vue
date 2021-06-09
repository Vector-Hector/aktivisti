<template>
  <div class="q-pt-sm q-gutter-y-md">
    <div class="row">
      <div class="col-12">

        <QBtn
          v-if="eventPermissions.report.GET"
          :to="{ name: 'event-detail-report', params: { event: event.id }}"
          size="sm"
          color="primary"
          flat
          :icon="ionBarChart"
        />
        <QBtn
          v-if="eventPermissions.self.PUT"
          :to="{name: 'edit-event-details', params: { event: event.id }}"
          size="sm"
          color="primary"
          flat
          :icon="ionPencil"
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
        class="participants"
        @click="openInviteModal"
      >
          <i class="pi pi-user" /> {{ participations.length }}/{{ event.max_participants ?? '∞' }}
        </span>
        <p class="description">
          {{ event.description }}
        </p>
      </div>
    </div>
    <div
      class="areas row q-col-gutter-y-md"
    >
      <div class="col-12">
        <QList
          v-if="isMember"
          class="area-list"
        >
          <EventAreaItem
            v-for="area in eventAreasSorted"
            :key="area.id"
            :area="area"
            :participations="participations"
          />
        </QList>
      </div>
    </div>
    <div class="social-buttons row q-gutter-xs" v-if="event">
      <QBtn
        type="a"
        target="_blank"
        :href="twitterShareUrl"
        size="sm"
        class="social-button"
        label="teilen"
        :icon="ionLogoTwitter"
      />
      <QBtn
        type="a"
        target="_blank"
        :href="facebookShareUrl"
        size="sm"
        class="social-button"
        label="teilen"
        :icon="ionLogoFacebook"
      />
      <QBtn
        type="a"
        target="_blank"
        :href="whatsappShareUrl"
        size="sm"
        class="social-button"
        label="teilen"
        :icon="ionLogoWhatsapp"
      />
      <QBtn
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
          v-if="eventPermissions.invite.POST"
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
import { authService } from 'src/api/authService'
import { userStore } from 'src/store/UserStore'
import EventInvitePeopleModal from 'src/components/modals/EventInvitePeopleModal.vue'
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
  ionPencil
} from '@quasar/extras/ionicons-v5'
import { QBtn, QList } from 'quasar'


export default defineComponent({
  name: 'EventDetailOverview',
  mixins: [EventDetailMixin],
  components: {
    EventAreaItem,
    QBtn,
    QList
  },
  props: {
    id: {
      type: String as PropType<string>,
      required: true
    }
  },
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
      ionPencil
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
      return authService.isLoggedIn()
    },
    isMember(): boolean {
      const participation = this.participations.find(({user}) => user === userStore.getState().user?.id)
      return participation !== undefined && !participation.is_pending_invitation
    },
    isInvited(): boolean {
      return this.participations.find(({user}) => user === userStore.getState().user?.id)?.is_pending_invitation ?? false
    },
    isCampaignAdmin(): boolean {
      return userStore.isManager()
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
      this.joinLoading = true
      await this.$apiClient.events.join(this.id)
      await this.refreshParticipations()
      this.joinLoading = false
    },
    async leave() {
      this.joinLoading = true
      try {
        await this.$apiClient.events.leave(this.id)
        await this.refreshParticipations()
      } catch (e) {
        // getting 404 means the event is vanished from queryable objects, lost access
        if (e.response?.status === 404) {
          this.$router.go(-1)
        }
      } finally {
        this.joinLoading = false
      }
    },
    async acceptInvite() {
      this.joinLoading = true
      const invite = this.participations.find(({user}) => user === userStore.getState().user?.id)
      if (invite) {
        await this.$apiClient.eventParticipations.accept(invite.id.toString())
      }
      await this.refreshParticipations()
      this.joinLoading = false
    },
    async refreshParticipations() {
      this.participations = (await apiClient.eventParticipations.list({event: this.event.id})).payload.data
    },
    openInviteModal() {
      this.$q.dialog({
        component: EventInvitePeopleModal,
        componentProps: {
          eventId: this.event.id
        }
      })
        .onDismiss(() => {
          void this.refreshParticipations()
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
