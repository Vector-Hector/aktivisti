<template>
  <div class="container">
    <QList>
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
        v-for="participation in eventParticipations"
        :key="participation.id"
        :clickable="true"
        :to="{ name: 'event-detail', params: { id: participation.event } }"
      >
        <QItemSection>
          <QItemLabel>
            {{ eventForParticipation(participation).name }}
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
              color="primary"
              @click.prevent.stop="accept(participation)"
            >
              Annehmen
            </QBtn>
            <QBtn
              flat
              @click.prevent.stop="reject(participation)"
            >
              Ablehnen
            </QBtn>
          </div>
        </QItemSection>
      </QItem>
    </QList>

  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { EventDto } from 'src/api/model/EventDto'
import { userStore } from 'src/store/UserStore'
import { EventParticipationDto } from 'src/api/model/EventParticipationDto'
import { UserDto } from 'src/api/model/UserDto'
import { QBtn, QItem, QItemLabel, QItemSection, QList } from 'quasar'

export default defineComponent({
  name: 'MyEvents',
  components: {
    QList,
    QItem,
    QItemLabel,
    QItemSection,
    QBtn,
  },
  data() {
    return {
      events: [] as EventDto[],
      eventParticipations: [] as EventParticipationDto[],
      invitingUsers: [] as UserDto[]
    }
  },
  created() {
    void this.getEvents()
  },
  methods: {
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
    findInvitingUsers(findIds: number[]): UserDto[] {
      return this.invitingUsers.filter(({id}) => findIds.includes(id))
    }
  }
})
</script>

<style lang="scss" scoped>
@import "src/css/_globals.scss";

.checkbox-margin-right {
  margin-right: 10px;
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
