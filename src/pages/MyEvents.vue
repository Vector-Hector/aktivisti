<template>
  <QPage class="flex-fill">
    <div class="container">
      <PageLoadingSpinner v-if="loading" />
      <QList
        v-else
      >
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
        <QItem
          v-for="{participation, event} in eventsByParticipation"
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
              <i v-if="participation.is_pending_invitation">
                {{
                  findInvitingUsers(participation.inviting_users).map(({username}) => username).join(',') ?? 'Unbekannt '
                }}
                <span v-if="participation.inviting_users.length > 1">haben</span><span v-else>hat</span> dich eingeladen
              </i>
            </QItemLabel>

          </QItemSection>
          <QItemSection side>
            <div
              v-if="participation.is_pending_invitation"
              class="action-buttons"
            >
              <QBtn
                round
                dense
                flat
                @click.prevent.stop="reject(participation)"
                :icon="ionClose"
              />
              <QBtn
                round
                dense
                flat
                color="primary"
                @click.prevent.stop="accept(participation)"
                :icon="ionCheckmark"
              />
            </div>
          </QItemSection>
        </QItem>
      </QList>
    </div>
  </QPage>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { EventDto } from 'src/api/model/EventDto'
import { userStore } from 'src/store/UserStore'
import { EventParticipationDto } from 'src/api/model/EventParticipationDto'
import { UserDto } from 'src/api/model/UserDto'
import { QBtn, QItem, QItemLabel, QItemSection, QList, QPage } from 'quasar'
import { CampaignDto } from 'src/api/model/CampaignDto'
import { ionCheckmark, ionClose } from '@quasar/extras/ionicons-v5'
import PageLoadingSpinner from 'components/PageLoadingSpinner.vue'

export default defineComponent({
  name: 'MyEvents',
  components: {
    PageLoadingSpinner,
    QList,
    QItem,
    QItemLabel,
    QItemSection,
    QBtn,
    QPage
  },
  data() {
    return {
      events: [] as EventDto[],
      eventParticipations: [] as EventParticipationDto[],
      invitingUsers: [] as UserDto[],
      campaigns: [] as CampaignDto[],
      ionCheckmark,
      ionClose,
      loading: true
    }
  },
  computed: {
    eventsByParticipation(): { participation: EventParticipationDto, event?: EventDto }[] {
      return this.eventParticipations.map((participation) => {
        return {
          participation,
          event: this.eventForParticipation(participation)
        }
      })
    }
  },
  async created() {
    await Promise.all([
      this.getEvents(),
      this.getCampaigns()
    ])

    this.loading = false
  },
  methods: {
    async getCampaigns() {
      const response = (await this.$apiClient.campaigns.list())
      this.campaigns = response.payload.data
    },
    async getEvents() {
      const responseData = (await this.$apiClient.eventParticipations.list(
        {user: userStore.getState().user?.id}, ['event', 'inviting_users']
      )).payload
      this.events = responseData.embedded.event
      this.invitingUsers = responseData.embedded.inviting_users
      this.eventParticipations = responseData.data
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
      return this.events.find(({id}) => participation.event === id)
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

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
}

</style>
