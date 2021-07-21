<template>
  <QPage class="flex column col-grow">
    <QScrollArea
      class="flex col-grow">
      <div class="container col-grow">
        <PageLoadingSpinner v-if="loading" />
        <div
          v-else
          class="my-participations-content"
        >
          <div v-show="pendingEvents.length > 0">
            <h3 class="my-participations-section-heading">Offene Einladungen</h3>
            <QSeparator class="profile-section-divider" />

            <QList
            >
              <QItem
                v-for="{participation, event} in pendingEvents"
                :key="participation.id"
                :clickable="true"
                :to="{ name: 'event-detail', params: { eventId: participation.event } }"
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
          <h3 class="my-participations-section-heading">Aktive Teilnahmen</h3>
          <QSeparator class="profile-section-divider" />

            <QList
            >
              <QItem
                v-for="{participation, event} in acceptedEvents"
                :key="participation.id"
                :clickable="true"
                :to="{ name: 'event-detail', params: { eventId: participation.event } }"
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
    </QScrollArea>
  </QPage>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { EventDto } from 'src/api/model/EventDto'
import { EventParticipationDto } from 'src/api/model/EventParticipationDto'
import { UserDto } from 'src/api/model/UserDto'
import { QBtn, QItem, QItemLabel, QItemSection, QList, QPage, QScrollArea, QSeparator } from 'quasar'
import { CampaignDto } from 'src/api/model/CampaignDto'
import { ionCheckmark, ionClose } from '@quasar/extras/ionicons-v5'
import PageLoadingSpinner from 'components/PageLoadingSpinner.vue'
import { myParticipationsStore } from 'src/store/MyParticipationsStore'
import { userStore } from 'src/store/UserStore'

export default defineComponent({
  name: 'MyParticipations',
  components: {
    PageLoadingSpinner,
    QList,
    QItem,
    QItemLabel,
    QItemSection,
    QBtn,
    QPage,
    QSeparator,
    QScrollArea
  },
  data() {
    return {
      participatedEvents: [] as EventDto[],
      invitingUsers: [] as UserDto[],
      campaigns: [] as CampaignDto[],
      ionCheckmark,
      ionClose,
      loading: true
    }
  },
  computed: {
    eventParticipations: {
      get(): EventParticipationDto[] {
        return myParticipationsStore.getState().eventParticipations
      },
      set(value: EventParticipationDto[]) {
        myParticipationsStore.setEventParticipations(value)
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
    ])

    this.loading = false
  },
  methods: {
    async getCampaigns() {
      const response = (await this.$apiClient.campaigns.list())
      this.campaigns = response.payload.data
    },
    async getParticipatedEvents() {
      const responseData = (await this.$apiClient.eventParticipations.list(
        {user: userStore.getState().user?.id}, ['event', 'inviting_users']
      )).payload
      this.participatedEvents = responseData.embedded.event
      this.invitingUsers = responseData.embedded.inviting_users
      myParticipationsStore.setEventParticipations(responseData.data)
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
    }
  }
})
</script>

<style lang="scss" scoped>
@import "src/css/variables.scss";

.my-participations-section-heading {
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
