<template>
  <div class="container">
    <IonContent>
      <IonList>
        <div
          v-if="eventParticipations.length <= 0"
          class="placeholder"
        >
          <IonText>Du nimmst an keinen Veranstaltungen teil - suche jetzt welche!</IonText>
          <router-link
            :to="{ name: 'events' }"
          >
            <IonButton>Jetzt nach Events suchen</IonButton>
          </router-link>
        </div>
        <IonItem
          v-for="participation in eventParticipations"
          :key="participation.id"
          :button="true"
          @click="$router.push({ name: 'event-detail', params: { id: participation.event } })"
        >
          <IonLabel>
            {{ eventForParticipation(participation).name }}
          </IonLabel>
          <i v-if="participation.is_pending_invitation">
            {{
              findInvitingUsers(participation.inviting_users).map(({username}) => username).join(',') ?? 'Unbekannt '
            }}
            <span v-if="participation.inviting_users.length > 1">haben</span><span v-else>hat</span> dich eingeladen
          </i>
          <div
            v-if="participation.is_pending_invitation"
            slot="end"
            class="action-buttons"
          >
            <IonButton
              @click.stop="accept(participation)"
            >
              Annehmen
            </IonButton>
            <IonButton
              fill="none"
              @click.stop="reject(participation)"
            >
              Ablehnen
            </IonButton>
          </div>
        </IonItem>
      </IonList>
    </IonContent>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { IonLabel, IonItem, IonList, IonButton, IonText, IonContent } from '@ionic/vue'
import { EventDto } from '@/api/model/EventDto'
import { userStore } from '@/store/UserStore'
import { EventParticipationDto } from '@/api/model/EventParticipationDto'
import { UserDto } from '@/api/model/UserDto'

export default defineComponent({
  name: 'MyEvents',
  components: {
    IonList,
    IonLabel,
    IonItem,
    IonButton,
    IonText,
    IonContent,
  },
  data() {
    return {
      events: [] as EventDto[],
      eventParticipations: [] as EventParticipationDto[],
      invitingUsers: [] as UserDto[]
    }
  },
  async created() {
    this.getEvents()
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
      this.$apiClient.eventParticipations.accept(eventParticipation.id.toString())
    },
    reject(eventParticipation: EventParticipationDto) {
      this.eventParticipations = this.eventParticipations.filter(({id}) => id !== eventParticipation.id)
      this.$apiClient.eventParticipations.reject(eventParticipation.id.toString())
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
@import "src/scss/_globals.scss";

.checkbox-margin-right {
  margin-right: 10px;
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
