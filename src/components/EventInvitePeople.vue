<template>
  <IonGrid>
    <IonRow>
      <IonCol>
        <AutoComplete
          v-model="query"
          placeholder="Tippen, um Leute einzuladen"
          field="username"
          class="w-100 d-flex flex-col"
          :suggestions="suggestedUsers"
          @complete="searchUsers($event)"
          @itemSelect="inviteUser($event.value)"
        >
          <template #item="slotProps">
            <div class="user-autocomplete-username">
              {{ slotProps.item.username }}
            </div>
            <div class="user-autocomplete-email">
              {{ slotProps.item.email }}
            </div>
          </template>
        </AutoComplete>
      </IonCol>
    </IonRow>
    <IonRow>
      <IonCol>
        <IonList v-if="participations.length > 0">
          <IonItem
            v-for="participation in displayedParticipations"
            :key="participation.id"
          >
            <IonLabel v-if="participation.user_is_member">
              <b>{{ participation.user_username }}</b> {{ participation.user_email }}
            </IonLabel>
            <IonLabel v-else>
              {{ participation.user_email }}
            </IonLabel>
            <div
              slot="end"
              class="invitation-item-actions"
            >
              <IonIcon
                v-if="participation.is_pending_invitation"
                name="mail"
                class="invited-button"
                aria-label="Nutzer hat Einladung erhalten"
              />
              <IonButton
                fill="none"
                @click="deleteParticipation(participation.id)"
              >
                <IonIcon
                  name="close"
                  aria-label="Nutzer von der Aktion entfernen"
                />
              </IonButton>
            </div>
          </IonItem>
          <IonItem
            v-if="pendingUsersWithoutVisibleEmailAddresses > 0"
          >
            <IonLabel>
              {{ pendingUsersWithoutVisibleEmailAddresses }} weitere per Mail eingeladen
            </IonLabel>
          </IonItem>
        </IonList>
        <IonText v-else>
          Keine Teilnehmer*innen, nutze das Eingabefeld um welche einzuladen
        </IonText>
      </IonCol>
    </IonRow>
  </IonGrid>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import AutoComplete from 'primevue/autocomplete'
import { IonButton, IonCol, IonGrid, IonIcon, IonItem, IonLabel, IonList, IonRow, IonText } from '@ionic/vue'
import { EventParticipationDto } from 'src/api/model/EventParticipationDto'
import { UserDto } from 'src/api/model/UserDto'
import { addIcons } from 'ionicons'
import { mail } from 'ionicons/icons'
import { userStore } from 'src/store/UserStore'

addIcons({
  mail
})

interface UserSuggestionItem extends UserDto {
  isInvitePlaceholder?: boolean
}

export default defineComponent({
  name: 'EventInvitePeople',
  components: {
    AutoComplete,
    IonList,
    IonItem,
    IonLabel,
    IonText,
    IonRow,
    IonCol,
    IonIcon,
    IonButton,
    IonGrid
  },
  props: {
    eventId: {
      type: Number as PropType<number>,
      required: true
    }
  },
  data() {
    return {
      query: '',
      suggestedUsers: [] as UserSuggestionItem[],
      participations: [] as EventParticipationDto[]
    }
  },
  computed: {
    pendingUsersWithoutVisibleEmailAddresses(): number {
      return this.participations.filter((item) => !item.user_is_member && item.user_email === null).length
    },
    displayedParticipations(): EventParticipationDto[] {
      return this.participations
        .filter((item) => item.user_is_member || item.user_email !== null)
        .filter((item) => {
          return item.user != userStore.getState().user?.id
        }).sort((a, b) => {
          if (a.is_pending_invitation && !b.is_pending_invitation) {
            return -1
          } else {
            return a.user_username.localeCompare(b.user_username)
          }
        })
    }
  },
  async created() {
    this.participations = (await this.$apiClient.eventParticipations.list({event: this.eventId})).payload.data
  },
  methods: {
    getInvitePlaceholder(emailString: string): UserSuggestionItem {
      return {
        id: -1,
        roles: [],
        username: 'Nutzer einladen:',
        email: emailString,
        isInvitePlaceholder: true
      }
    },
    async searchUsers(event: any) {
      const suggestions = (await this.$apiClient.user.list({query: event.query})).payload.data
      // Show the invite user option in autocomplete if the email is not yet part of our suggestions
      if (event.query.includes('@') && !suggestions.map(({email}) => email).includes(event.query)) {
        suggestions.push(this.getInvitePlaceholder(event.query))
      }
      this.suggestedUsers = suggestions
    },
    async inviteUser(user: UserSuggestionItem) {
      this.query = ''

      const inviteRequestBody = user.isInvitePlaceholder ? {
        users: [],
        email_addresses: [user.email]
      } : {
        email_addresses: [],
        users: [user.id]
      }
      const response = await this.$apiClient.events.invite(this.eventId.toString(), inviteRequestBody)
      for (const item of response.payload.data) {
        if (!this.participations.find(({id}) => id === item.id)) {
          this.participations.push(item)
        }
      }
    },
    async deleteParticipation(deleteId: number) {
      this.participations = this.participations.filter(({id}) => deleteId !== id)
      await this.$apiClient.eventParticipations.delete(deleteId.toString())
    }
  }
})
</script>

<style lang="scss" scoped>
@import "src/css/utils";
@import "src/css/_variables.scss";

.user-autocomplete-username {
  font-weight: bold;
}

.invitation-item-actions {
  display: flex;
  flex-direction: row;
}

.invited-button {
  color: $gray-500;
  justify-self: center;
  align-self: center;
}
</style>
