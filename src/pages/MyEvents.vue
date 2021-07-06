<template>
  <QPage class="flex-fill">
    <div class="container">
      <PageLoadingSpinner v-if="loading" />
      <div
        v-else
        class="my-events-content"
      >
        <div v-show="pendingEvents.length > 0" >
          <h3 class="my-events-section-heading">Offene Einladungen</h3>
          <QSeparator class="profile-section-divider" />

          <QList
          >
            <QItem
              v-for="{participation, event} in pendingEvents"
              :key="participation.id"
              :clickable="true"
              :to="{ name: 'event-detail', params: { id: participation.event } }"
            >
              <QItemSection>
                <QItemLabel>
                  <b>{{ event.name }}</b>
                </QItemLabel>
                <QItemLabel>
                  {{ campaignsByIds(event.campaigns).map(({name}) => name).join(',') }}
                </QItemLabel>
                <QItemLabel>
                  {{ $utils.dateFormat(event.start_date) }}
                </QItemLabel>
                <QItemLabel>
                  <i>
                    {{
                      findInvitingUsers(participation.inviting_users).map(({username}) => username).join(',') ?? 'Unbekannt '
                    }}
                    <span v-if="participation.inviting_users.length > 1">haben</span><span v-else>hat</span> dich
                    eingeladen
                  </i>
                </QItemLabel>

              </QItemSection>
              <QItemSection side>
                <div
                  class="action-buttons"
                >
                  <QBtn
                    dense
                    flat
                    @click.prevent.stop="reject(participation)"
                    :icon="ionClose"
                  >
                    Ablehnen
                  </QBtn>
                  <QBtn
                    dense
                    flat
                    color="primary"
                    @click.prevent.stop="accept(participation)"
                    :icon="ionCheckmark"
                  >
                    Annehmen
                  </QBtn>
                </div>
              </QItemSection>
            </QItem>
          </QList>
        </div>

        <div v-show="acceptedEvents.length > 0">
          <h3 class="my-events-section-heading">Meine Aktionen</h3>
          <QSeparator class="profile-section-divider" />

          <QList
          >
            <QItem
              v-for="{participation, event} in acceptedEvents"
              :key="participation.id"
              :clickable="true"
              :to="{ name: 'event-detail', params: { id: participation.event } }"
            >
              <QItemSection>
                <QItemLabel>
                  <b>{{ event.name }}</b>
                </QItemLabel>
                <QItemLabel>
                  {{ campaignsByIds(event.campaigns).map(({name}) => name).join(',') }}
                </QItemLabel>
                <QItemLabel>
                  {{ $utils.dateFormat(event.start_date) }}
                </QItemLabel>
              </QItemSection>
            </QItem>
          </QList>
        </div>
        <div
          v-if="eventParticipations.length <= 0"
          class="placeholder"
        >
          <p>Du nimmst an keinen Aktion teil - suche jetzt welche!</p>
          <QBtn
            label="Jetzt nach Aktionen suchen"
            :to="{ name: 'events' }"
            color="primary"
          />
        </div>
      </div>
    </div>
  </QPage>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { EventDto } from 'src/api/model/EventDto'
import { EventParticipationDto } from 'src/api/model/EventParticipationDto'
import { UserDto } from 'src/api/model/UserDto'
import { QBtn, QItem, QItemLabel, QItemSection, QList, QPage, QSeparator } from 'quasar'
import { CampaignDto } from 'src/api/model/CampaignDto'
import { ionCheckmark, ionClose, ionPencil, ionTrash } from '@quasar/extras/ionicons-v5'
import PageLoadingSpinner from 'components/PageLoadingSpinner.vue'
import { SubAssociationDto } from 'src/api/model/SubAssociationDto'
import { myEventsStore } from 'src/store/MyEventsStore'
import { userStore } from 'src/store/UserStore'

export default defineComponent({
  name: 'MyEvents',
  components: {
    PageLoadingSpinner,
    QList,
    QItem,
    QItemLabel,
    QItemSection,
    QBtn,
    QPage,
    QSeparator,
  },
  data() {
    return {
      participatedEvents: [] as EventDto[],
      invitingUsers: [] as UserDto[],
      campaigns: [] as CampaignDto[],
      subAssociations: [] as SubAssociationDto[],
      ionCheckmark,
      ionClose,
      ionPencil,
      ionTrash,
      loading: true
    }
  },
  computed: {
    eventParticipations: {
      get(): EventParticipationDto[] {
        return myEventsStore.getState().eventParticipations
      },
      set(value: EventParticipationDto[]){
        myEventsStore.setEventParticipations(value)
      }
    },
    acceptedEvents(): { participation: EventParticipationDto, event?: EventDto }[] {
      return this.eventParticipations
        .filter((item) => !item.is_pending_invitation)
        .map((participation) => {
          return {
            participation,
            event: this.eventForParticipation(participation)
         }
      }).sort((a, b) => {
        if (a.event && b.event) {
          return a.event?.start_date > b.event.start_date ? 1 : -1
        } else {
          return 0
        }
      })
    },
    pendingEvents(): { participation: EventParticipationDto, event?: EventDto }[] {
      return this.eventParticipations
        .filter((item) => item.is_pending_invitation)
        .map((participation) => {
          return {
            participation,
            event: this.eventForParticipation(participation)
          }
        }).sort((a, b) => {
        if (a.event && b.event) {
          return a.event?.start_date > b.event.start_date ? 1 : -1
        } else {
          return 0
        }
      })
    }
  },
  async created() {
    await Promise.all([
      this.getParticipatedEvents(),
      this.getCampaigns(),
      this.getSubAssociations(),
    ])

    this.loading = false
  },
  watch: {
    eventParticipations: {
      handler() {
        void this.getParticipatedEvents()
      },
      immediate: true
    }
  },
  methods: {
    async getCampaigns() {
      const response = (await this.$apiClient.campaigns.list())
      this.campaigns = response.payload.data
    },
    async getSubAssociations() {
      const response = (await this.$apiClient.subAssociations.list())
      this.subAssociations = response.payload.data
    },
    async getParticipatedEvents() {
      const responseData = (await this.$apiClient.eventParticipations.list(
        {user: userStore.getState().user?.id}, ['event', 'inviting_users']
      )).payload
      this.participatedEvents = responseData.embedded.event
      this.invitingUsers = responseData.embedded.inviting_users
      myEventsStore.setEventParticipations(responseData.data)
    },
    accept(eventParticipation: EventParticipationDto) {
      eventParticipation.is_pending_invitation = false
      void this.$apiClient.eventParticipations.accept(eventParticipation.id.toString())
    },
    reject(eventParticipation: EventParticipationDto) {
      this.eventParticipations = this.eventParticipations.filter(({id}) => id !== eventParticipation.id)
      void this.$apiClient.eventParticipations.reject(eventParticipation.id.toString())
    },
    eventForParticipation(participation: EventParticipationDto) {
      return this.participatedEvents.find(({id}) => participation.event === id)
    },
    campaignsByIds(findIds: number[]): CampaignDto[] {
      return this.campaigns.filter(({id}) => findIds.includes(id))
    },
    findInvitingUsers(findIds: number[]): UserDto[] {
      return this.invitingUsers.filter(({id}) => findIds.includes(id))
    },
    deleteEvent(event: EventDto) {
      this.$q.dialog({
        title: `${event.name} wirklich löschen?`,
        message: `Das Event <b>"${event.name}"</b> wird gelöscht und kann nicht wiederhergestellt werden.`,
        html: true,
        cancel: true,
        persistent: true
      }).onOk(async () => {
        try {
          await this.$apiClient.events.delete(event.id.toString())
        } catch (error) {
          this.$q.notify({
            position: 'top-right',
            type: 'negative',
            message: `${error.statusText ? error.statusText : 'Dieser Eintrag konnte nicht gelöscht werden.'}`,
            caption: `Fehlercode: ${error.status}`
          })
          return
        }
      })
    }
  }
})
</script>

<style lang="scss" scoped>
@import "src/css/variables.scss";

.my-events-section-heading {
  font-size: 1.3rem;
  margin: 1rem 0 0 0;
  line-height: 1.7rem;
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 1rem 0 0 0;
}

.filter-container {
  padding: 0 1em 1em 1em;
}

.action-buttons {
  display: flex;
  flex-direction: column;
}

</style>
