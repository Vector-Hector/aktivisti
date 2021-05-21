<template>
  <IonGrid class="full-width">
    <IonRow>
      <IonCol
        v-if="isCampaignAdmin"
        size="auto"
        class="ion-align-self-end"
      >
        <router-link :to="{ name: 'event-detail-report', params: { event: event.id }}">
          <IonButton
            fill="clear"
            size="small"
          >
            <IonIcon name="bar-chart-outline" />
          </IonButton>
        </router-link>
        <router-link
          :to="{name: 'edit-event-details', params: { event: event.id }}"
          replace
        >
          <IonButton
            fill="clear"
            size="small"
          >
            <IonIcon name="pencil" />
          </IonButton>
        </router-link>
      </IonCol>
    </IonRow>

    <IonRow>
      <IonCol size="2">
        Start:
      </IonCol>
      <IonCol
        size="10"
        class="start-date"
      >
        {{ new Date(event.start_date).toLocaleString([], dateOptions) }}
      </IonCol>
    </IonRow>
    <IonRow>
      <IonCol size="2">
        Ende:
      </IonCol>
      <IonCol
        class="end-date"
        size="10"
      >
        {{ event.end_date ? new Date(event.end_date).toLocaleString([], dateOptions) : 'Nicht definiert' }}
      </IonCol>
    </IonRow>
    <IonRow>
      <IonCol size="12">
        <span
          class="participants"
          @click="openInviteModal"
        >
          <i class="pi pi-user" /> {{ participations.length }}/{{ event.max_participants ?? '∞' }}
        </span>
        <p class="description">
          {{ event.description }}
        </p>
      </IonCol>
    </IonRow>
  </IonGrid>
  <div
    class="areas"
  >
    <IonList
      v-if="isMember"
      class="area-list"
    >
      <EventAreaItem
        v-for="area in eventAreasSorted"
        :key="area.id"
        :area="area"
        :participations="participations"
      />
    </IonList>
  </div>
  <div class="social-buttons">
    <a
      target="_blank"
      :href="twitterShareUrl"
    >
      <IonButton
        size="small"
        color="light"
      >
        <IonIcon
          slot="start"
          name="logo-twitter"
        />
        tweet
      </IonButton>
    </a>
    <a
      target="_blank"
      :href="facebookShareUrl"
    >
      <IonButton
        size="small"
        color="light"
      >
        <IonIcon
          slot="start"
          name="logo-facebook"
        />
        teilen
      </IonButton>
    </a>
    <a
      target="_blank"
      :href="whatsappShareUrl"
    >
      <IonButton
        size="small"
        color="light"
      >
        <IonIcon
          slot="start"
          name="logo-whatsapp"
        />
        teilen
      </IonButton>
    </a>
    <a
      target="_blank"
      :href="mailShareUrl"
    >
      <IonButton
        size="small"
        color="light"
      >
        <IonIcon
          slot="start"
          name="mail"
        />
        teilen
      </IonButton>
    </a>
  </div>
  <IonRow>
    <IonCol size="6">
      <IonButton
        v-if="isCampaignAdmin"
        class="full-width"
        button-type="secondary"
        @click="openInviteModal"
      >
        Leute einladen
      </IonButton>
    </IonCol>
    <IonCol size="6">
      <router-link
        v-if="!isLoggedIn"
        :to="{ name: 'login', query: {next: $router.resolve($route).path } }"
        button-type="primary"
        class="full-width"
      >
        <IonButton
          class="full-width"
        >
          Anmelden um mitzumachen
        </IonButton>
      </router-link>
      <IonButton
        v-else-if="isMember"
        :disabled="joinLoading"
        class="full-width"
        button-type="primary"
        @click="leave"
      >
        Doch nicht dabei
      </IonButton>
      <IonButton
        v-else-if="isInvited"
        class="full-width"
        :disabled="joinLoading"
        @click="acceptInvite"
      >
        Einladung annehmen
      </IonButton>
      <IonButton
        v-else-if="!isMember"
        class="full-width"
        :disabled="joinLoading"
        @click="join"
      >
        Ich bin dabei
      </IonButton>
    </IonCol>
  </IonRow>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { EventDto } from '@/api/model/EventDto'
import { EventAreaDto } from '@/api/model/EventAreaDto'
import {
  IonButton,
  IonCol,
  IonGrid,
  IonIcon,
  IonList,
  IonRow,
  modalController
} from '@ionic/vue'
import {
  logoTwitter,
  logoFacebook,
  mail,
  logoWhatsapp,
  barChartOutline
} from 'ionicons/icons'
import { addIcons } from 'ionicons'
import { authService } from '@/api/authService'
import { userStore } from '@/store/UserStore'
import EventInvitePeopleModal from '@/components/modals/EventInvitePeopleModal.vue'
import { apiClient } from '@/api/ApiClient'
import { EventParticipationDto } from '@/api/model/EventParticipationDto'
import { CampaignDto } from '@/api/model/CampaignDto'
import {
  createFacebookShareUrl,
  createMailShareUrl,
  createTwitterShareUrl,
  createWhatsappShareUrl
} from '@/utils/shareLinks'
import EventAreaItem from '@/components/EventAreaItem.vue'

addIcons({
  'logo-twitter': logoTwitter,
  'logo-whatsapp': logoWhatsapp,
  mail,
  'logo-facebook': logoFacebook,
  'bar-chart-outline': barChartOutline
})

export default defineComponent({
  name: 'EventDetailOverview',
  components: {
    EventAreaItem,
    IonButton,
    IonList,
    IonIcon,
    IonGrid,
    IonCol,
    IonRow
  },
  props: {
    id: {
      type: String as PropType<string>,
      required: true
    },
    event: {
      type: Object as PropType<EventDto>,
      required: true
    },
    campaigns: {
      type: Object as PropType<CampaignDto[]>,
      required: true
    },
    eventAreas: {
      type: Array as PropType<EventAreaDto[]>,
      required: true
    },
    participations: {
      type: Array as PropType<EventParticipationDto[]>,
      required: true
    }
  },
  emits: ['update:event', 'update:participations'],
  data() {
    return {
      loading: true,
      joinLoading: false,
      metrics: [
        {name: 'Geklopfte Türen', value: 'Geklopfte Türen'},
        {name: 'Geöffnete Türen', value: 'Geöffnete Türen'},
        {name: 'Gute Gespräche', value: 'Gute Gespräche'},
        {name: 'Zustimmung', value: 'Zustimmung'},
        {name: 'Unterschriften', value: 'Unterschriften'}
      ],
      dateOptions: {
        year: 'numeric',
        month: '2-digit',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
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
        this.event.description,
        window.location.origin + this.$router.resolve({
          name: 'event-detail',
          params: {
            id: this.event.id
          }
        }).path,
        []
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
        }).path
      )
    },
    whatsappShareUrl(): string {
      return createWhatsappShareUrl(
        window.location.origin + this.$router.resolve({
          name: 'event-detail',
          params: {
            id: this.event.id
          }
        }).path
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
      await this.$apiClient.events.leave(this.id)
      await this.refreshParticipations()
      this.joinLoading = false
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
      this.$emit(
        'update:participations',
        (await apiClient.eventParticipations.list({event: this.event.id})).payload.data
      )
    },
    async openInviteModal() {
      if (!this.isCampaignAdmin) return
      const modal = await modalController
        .create({
          component: EventInvitePeopleModal,
          componentProps: {
            eventId: this.event.id
          }
        })
      modal.onDidDismiss()
        .then(
          () => this.refreshParticipations()
        )
      await modal.present()
    }
  }
})

</script>

<style lang="scss" scoped>
@import "~@/scss/_globals.scss";
@import "~@/scss/_utils.scss";

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


</style>
