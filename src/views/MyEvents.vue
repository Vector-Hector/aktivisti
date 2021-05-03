<template>
  <div class="container">
    <IonList>
      <div
        v-if="eventParticipations.length <= 0"
        class="placeholder"
      >
        <IonText>Du nimmst an keinen Veranstaltungen teil - suche jetzt welche!</IonText>
        <router-link
          :to="{ name: 'events-map' }"
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
          {{ findInvitingUser(participation.user_inviting)?.username ?? 'Anyonym ' }}
          hat dich eingeladen
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
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { IonLabel, IonItem, IonList, IonButton, IonText } from '@ionic/vue'
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
    IonText
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
        {user: userStore.getState().user?.id}, ['event', 'user_inviting']
      )).payload
      this.events = responseData.embedded.event
      this.invitingUsers = responseData.embedded.user_inviting
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
    findInvitingUser(findId: number): UserDto | undefined {
      return this.invitingUsers.find(({id}) => findId === id)
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
