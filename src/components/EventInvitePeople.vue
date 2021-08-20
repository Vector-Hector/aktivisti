<template>
  <div class="q-qa-sm">
    <div class="row">
      <div class="col-grow">
        <QInput
          use-input
          dense
          v-model="usernameToInvite"
          placeholder="Nutzername"
          class="w-100 d-flex flex-col"
          @keydown.enter="inviteUser(usernameToInvite)"
        />
      </div>
      <div class="col-auto">
        <QBtn
          :icon="ionPersonAddSharp"
          color="primary"
          :disable="isLoading"
          flat
          round
          small
          @click="inviteUser(usernameToInvite)"
        />
      </div>
    </div>
    <div class="row">
      <div class="col">
        <QList v-if="participations.length > 0">
          <p>Bereits eingeladen:</p>
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
          Keine offenen Einladungen. Nutze das Eingabefeld um neue Teilnehmende einzuladen
        </p>
      </div>
    </div>
    <div class="row">
      <QBtn
        class="full-width"
        @click="handleInviteAllTeamCaptains"
      >
        Alle Teamcaptains einladen
      </QBtn>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { EventParticipationDto } from 'src/api/model/EventParticipationDto'
import { userStore } from 'src/store/UserStore'
import { ionClose, ionMail, ionPersonAddSharp } from '@quasar/extras/ionicons-v5'
import { QBtn, QIcon, QInput, QItem, QItemLabel, QItemSection, QList } from 'quasar'

interface UserSuggestionItem {
  id: number
  username: string
  email?: string
}

export default defineComponent({
  name: 'EventInvitePeople',
  components: {
    QBtn,
    QInput,
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
      isLoading: false,
      usernameToInvite: '',
      participations: [] as EventParticipationDto[],
      ionMail,
      ionClose,
      ionPersonAddSharp
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
          return a.user_username.localeCompare(b.user_username)
        })
    }
  },
  async created() {
    this.participations = (await
      this.$apiClient.eventParticipations.list(
        {
          event: this.eventId,
          is_pending_invitation: true
        })).payload.data
  },
  methods: {
    userLabel(item: UserSuggestionItem) {
      return `${item.username} ${item.email ?? ''}`
    },
    appendParticipations(participations: EventParticipationDto[]) {
      for (const participation of participations) {
        if (!this.participations.find(({id}) => id === participation.id)) {
          this.participations.push(participation)
        }
      }
    },
    async inviteUser(username: string) {
      const inviteRequestBody = {
        users: [username]
      }
      try {
        this.isLoading = true
        const response = await this.$apiClient.events.invite(this.eventId.toString(), inviteRequestBody)
        for (const item of response.payload.data) {
          if (!this.participations.find(({id}) => id === item.id)) {
            this.participations.push(item)
          }
        }
      } catch (error) {
        if (error.response?.status === 400) {
          this.$q.notify({
            color: 'negative',
            message: 'Der Nutzername existiert nicht'
          })
        } else {
          this.$q.notify({
            color: 'negative',
            message: 'Etwas ging schief beim Einladen des Nutzers'
          })
        }
      } finally {
        this.isLoading = false
      }

    },
    handleInviteAllTeamCaptains() {
      this.$q.dialog({
        title: 'Alle Teamcaptains einladen',
        message: 'Möchtest du alle Teamcaptains des Kreisverbandes einladen?',
        cancel: true
      }).onOk(() => this.inviteTeamCaptains())
    },
    async inviteTeamCaptains() {
      const response = await this.$apiClient.events.inviteTeamCaptains(this.eventId.toString())
      const newParticipations = response.payload.data
      if (newParticipations.length > 0) {
        let areTeamCaptainsAlreadyInvited = true
        for (const participation of response.payload.data) {
          if (!this.participations.find(({id}) => id === participation.id)) {
            areTeamCaptainsAlreadyInvited = false
            this.participations.push(participation)
          }
        }
        if (areTeamCaptainsAlreadyInvited) {
          this.$q.notify({
            color: 'warning',
            message: 'Es wurden bereits alle Teamcaptains eingeladen.'
          })
        }
      } else {
        this.$q.notify({
          color: 'info',
          message: 'In diesem Eventgebiet gibt es keine Teamcaptains.'
        })
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
  color: $grey-4;
  justify-self: center;
  align-self: center;
}
</style>
