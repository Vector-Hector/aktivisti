<template>
  <div class="row">
    <div class="col">
      <QList v-if="areTeamCaptainsParticipations.length > 0">
        <QToolbarTitle>Team Captains</QToolbarTitle>
        <QSeparator spced/>
        <QItem
          v-for="participation in areTeamCaptainsParticipations"
          :key="participation.id"
        >
          <QItemSection>
            <QItemLabel v-if="participation.user_is_member">
              <q-item-label lines="1"><b>{{ participation.user_username}} </b></q-item-label>
              <q-item-label caption>{{ participation.user_email }}</q-item-label>
            </QItemLabel>
            <QItemLabel v-else>
              {{ participation.user_email }}
            </QItemLabel>
          </QItemSection>
          <QItemSection side>
            <div
              class="invitation-item-actions"
            >
              <QBtn
                fill="none"
                size="md"
                :icon="ionClose"
                dense
                flat
                round
                @click="deleteParticipation(participation.id)"

                aria-label="Nutzer:in von der Aktion entfernen"
              />
            </div>
          </QItemSection>
        </QItem>
      </QList>
      <QList v-if="verifiedParticipations.length > 0">
        <QToolbarTitle>Bestätigte Teilnehmer*innen</QToolbarTitle>
        <QSeparator spced/>
        <QItem
          v-for="participation in verifiedParticipations"
          :key="participation.id"
        >
          <QItemSection>
            <QItemLabel v-if="participation.user_is_member">
              <q-item-label lines="1"><b>{{ participation.user_username}} </b></q-item-label>
              <q-item-label caption>{{ participation.user_email }}</q-item-label>
            </QItemLabel>
            <QItemLabel v-else>
              {{ participation.user_email }}
            </QItemLabel>
          </QItemSection>

          <QItemSection side>
            <div
              class="invitation-item-actions"
            >
              <QBtn
                fill="none"
                size="md"
                :icon="ionClose"
                dense
                flat
                round
                @click="deleteParticipation(participation.id)"
                aria-label="Nutzer:in von der Aktion entfernen"
              />
              <QBtn
                fill="none"
                size="md"
                :icon="matArrowCircleUp"
                dense
                flat
                round
                @click="handleInviteToTeamCaptain(participation.user, participation.user_username)"
                aria-label="Nutzer:in zu Teamcaptain machen"
              />
            </div>
          </QItemSection>

        </QItem>
      </QList>
      <QList v-if="notVerifiedParticipations.length > 0">
        <QToolbarTitle>Teilnehmer*innen bestätigen</QToolbarTitle>
        <QSeparator spced/>
        <QItem
          v-for="participation in notVerifiedParticipations"
          :key="participation.id"
        >
          <QItemSection>
            <QItemLabel v-if="participation.user_is_member">
              <q-item-label lines="1"><b>{{ participation.user_username}} </b></q-item-label>
              <q-item-label caption>{{ participation.user_email }}</q-item-label>
            </QItemLabel>
            <QItemLabel v-else>
              {{ participation.user_email }}
            </QItemLabel>
          </QItemSection>

          <QItemSection side>
            <div
              class="invitation-item-actions"
            >
              <QBtn
                fill="none"
                size="md"
                dense
                flat
                round
                aria-label="Nutzer:in von der Aktion entfernen"
                :icon="ionClose"
                @click="deleteParticipation(participation.id)"
              />
              <QBtn
                fill="none"
                size="md"
                color="positive"
                :icon="ionCheckmark"
                dense
                flat
                round
                @click="verifyParticipation(participation.id)"
              />

            </div>
          </QItemSection>

        </QItem>
      </QList>
      <p v-if="verifiedParticipations.length === 0 && notVerifiedParticipations.length === 0">
        Keine Teilnehmer*innen. Nutze den "Leute einladen"-Button um welche einzuladen.
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { EventParticipationDto } from 'src/api/model/EventParticipationDto'
import { ionClose, ionCheckmark, ionTrash } from '@quasar/extras/ionicons-v5'
import { matArrowCircleUp } from '@quasar/extras/material-icons'
import { QBtn, QItem, QItemLabel, QItemSection, QList, QSeparator, QToolbarTitle } from 'quasar'
import { apiClient } from 'src/api/ApiClient';
import { userStore } from 'src/store/UserStore';
import { ObjectPermissions } from 'src/api/model/ObjectPermissionDto';
import { ContentType } from 'src/api/model/UserObjectPermissionDto';

interface EventParticipationNTeamCaptain extends EventParticipationDto {
  is_team_captain?: boolean
}

export default defineComponent({
  name: 'EventParticipantsList',
  components: {
    QList,
    QItem,
    QItemLabel,
    QItemSection,
    QBtn,
    QToolbarTitle,
    QSeparator,
  },
  props: {
    eventId: {
      type: Number as PropType<number>,
      required: true
    },
    eventSubAssociation: {
      type: Number as PropType<number>,
      required: false
    }
  },
  data() {
    return {
      participations: [] as EventParticipationNTeamCaptain[],
      ionClose,
      ionCheckmark,
      ionTrash,
      matArrowCircleUp
    }
  },
  computed: {
    verifiedParticipations(): EventParticipationNTeamCaptain[] {
      return this.participations.filter(({is_verified, is_team_captain}) => !is_team_captain && is_verified)
    },
    notVerifiedParticipations(): EventParticipationNTeamCaptain[] {
      return this.participations.filter(({is_verified, is_team_captain}) => !is_team_captain && !is_verified)
    },
    areTeamCaptainsParticipations(): EventParticipationNTeamCaptain[] {
      return this.participations.filter(({is_team_captain}) => is_team_captain)
    }
  },
  async created() {
    const responseUserPermissions = await apiClient.userPermissions.list()
    const permissions = responseUserPermissions.payload.data
    userStore.setPermissions(permissions)
    this.participations = (await
      this.$apiClient.eventParticipations.list(
        {
          event: this.eventId,
          is_pending_invitation: false
        })).payload.data as EventParticipationNTeamCaptain[]
    this.participations.map((participation) => {
      const isTeamcaptain = permissions.some(({user, permission_codename, content_type_name, object_pk}) => {
        return participation.user === user &&
          permission_codename === ObjectPermissions.TeamCaptain &&
          content_type_name === ContentType.SUB_ASSOCIATION &&
          object_pk === this.eventSubAssociation?.toString()
      })
      participation['is_team_captain'] = isTeamcaptain
    })
  },
  methods: {
    async deleteParticipation(deleteId: number) {
      this.participations = this.participations.filter(({id}) => deleteId !== id)
      await this.$apiClient.eventParticipations.delete(deleteId.toString())
    },

    async verifyParticipation(participationId: number) {
      const participationIndex = this.participations.findIndex(({id}) => participationId === id)
      const participationRequest = await this.$apiClient.eventParticipations.patch(participationId.toString(), {
        is_verified: true
      })
      this.participations[participationIndex] = participationRequest.payload.data
    },
    async elevateToTeamCaptain(userId: number) {
      try {
        await apiClient.user.elevateToTeamCaptain(userId.toString(), this.eventSubAssociation)
        const participation = this.participations.find(({user}) => user === userId)
        participation!['is_team_captain'] = true
      } catch (e) {
        if (e.response?.status === 400 && e.response?.data?.sub_association){
          this.$q.notify({
            color: 'negative',
            message: 'Diesem Event ist kein gültiger Landkreis zugeordnet. Die Ernennung einer*eines Teamcaptains ' +
              'ist an einen Landkreis gebunden.'
          })
        }
        this.$q.notify({
          color: 'negative',
          message: 'Ein unerwarteter Fehler ist aufgetreten'
        })
      }
    },
    handleInviteToTeamCaptain(userId: number, username: string) {
      this.$q.dialog({
        title: 'Benutzer*innen zu Teamcaptain hochstufen',
        message: `Möchtest du die*den Nutzer*in <b>${username}</b> zur*zum Teamcaptain hochstufen?`,
        html: true,
        cancel: true
      }).onOk(() => this.elevateToTeamCaptain(userId))
    }

  }
})
</script>

<style scoped>

</style>
