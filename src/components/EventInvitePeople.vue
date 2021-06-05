<template>
  <div class="q-qa-sm">
    <div class="row">
      <div class="col">
        <QSelect
          use-input
          :model-value="selectedUsers"
          :multiple="true"
          placeholder="Tippen, um Leute einzuladen"
          :option-label="userLabel"
          class="w-100 d-flex flex-col"
          :options="suggestedUsers"
          @filter="searchUsers"
          @add="inviteUser($event.value)"
        >
          <template #item="slotProps">
            <div class="user-autocomplete-username">
              {{ slotProps.item.username }}
            </div>
            <div class="user-autocomplete-email">
              {{ slotProps.item.email }}
            </div>
          </template>
        </QSelect>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <QList v-if="participations.length > 0">
          <QItem
            v-for="participation in displayedParticipations"
            :key="participation.id"
          >
            <QItemSection>
              <QItemLabel v-if="participation.user_is_member">
                <b>{{ participation.user_username }}</b> {{ participation.user_email }}
              </QItemLabel>
              <QItemLabel v-else>
                {{ participation.user_email }}
              </QItemLabel>
            </QItemSection>

            <QItemSection side>
              <div
                class="invitation-item-actions"
              >
                <QIcon
                  v-if="participation.is_pending_invitation"
                  :name="ionMail"
                  class="invited-button"
                  aria-label="Nutzer hat Einladung erhalten"
                />
                <QIcon
                  fill="none"
                  @click="deleteParticipation(participation.id)"
                >
                  <QIcon
                    :name="ionClose"
                    aria-label="Nutzer von der Aktion entfernen"
                  />
                </QIcon>
              </div>
            </QItemSection>

          </QItem>
          <QItem
            v-if="pendingUsersWithoutVisibleEmailAddresses > 0"
          >
            <QItemSection>
              <QItemLabel>
                {{ pendingUsersWithoutVisibleEmailAddresses }} weitere per Mail eingeladen
              </QItemLabel>
            </QItemSection>
          </QItem>
        </QList>
        <p v-else>
          Keine Teilnehmer*innen, nutze das Eingabefeld um welche einzuladen
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { EventParticipationDto } from 'src/api/model/EventParticipationDto'
import { userStore } from 'src/store/UserStore'
import { ionClose, ionMail } from '@quasar/extras/ionicons-v5'
import { QIcon, QItem, QItemLabel, QItemSection, QList, QSelect } from 'quasar'

interface UserSuggestionItem {
  id: number
  username: string
  email: string
  isInvitePlaceholder?: boolean
}

export default defineComponent({
  name: 'EventInvitePeople',
  components: {
    QSelect,
    QList,
    QItem,
    QItemLabel,
    QItemSection,
    QIcon
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
      selectedUsers: [],
      suggestedUsers: [] as UserSuggestionItem[],
      participations: [] as EventParticipationDto[],
      ionMail,
      ionClose
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
    userLabel(item: UserSuggestionItem) {
      return `${item.username} ${item.email ?? ''}`
    },
    getInvitePlaceholder(emailString: string): UserSuggestionItem {
      return {
        id: -1,
        username: 'Nutzer einladen:',
        email: emailString,
        isInvitePlaceholder: true
      }
    },
    async searchUsers(query: string, update: any) {
      let suggestions: UserSuggestionItem[]
      if (query) {
        suggestions = (await this.$apiClient.user.list({query: query})).payload.data
        // Show the invite user option in autocomplete if the email is not yet part of our suggestions
        if (query.includes('@') && !suggestions.map(({email}) => email).includes(query)) {
          suggestions.push(this.getInvitePlaceholder(query))
        }
      } else {
        suggestions = []
      }
      update(() => {
        this.suggestedUsers = suggestions
      })
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
