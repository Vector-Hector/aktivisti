<template>
  <QSelect
    v-if="isTeamCaptainOrCoordinator"
    :model-value="eventAreaParticipants"
    @update:model-value="updateAreaParticipations($event)"
    :multiple="true"
    label="Teilnehmer*innen"
    :options="onlyMemberParticipants"
    option-label="user_username"
    :display-value="
      eventAreaParticipants.map(({ user_username }) => user_username).join(',')
    "
  />
  <div
    v-else-if="personalParticipationPermissions?.assign_event_area?.POST"
    class="join-buttons"
  >
    <QBtn v-if="isUserEventAreaParticipant" @click="leaveArea" flat>
      Doch nicht hier mitmachen
    </QBtn>
    <QBtn v-else color="primary" @click="joinArea">
      In diesem Gebiet mitmachen
    </QBtn>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { userStore } from 'src/store/UserStore'
import { EventParticipationDto } from 'src/api/model/EventParticipationDto'
import { QBtn, QSelect } from 'quasar'
import { useEventDetailStore } from 'pages/event-map/detail/EventDetailStoreMixin'

export default defineComponent({
  name: 'AssignAreaParticipants',
  components: {
    QSelect,
    QBtn
  },
  setup() {
    const {
      eventArea,
      isTeamCaptainOrCoordinator,
      personalParticipationPermissions,
      personalParticipation,
      participations,
      refreshParticipants
    } = useEventDetailStore()
    return {
      eventArea,
      isTeamCaptainOrCoordinator,
      personalParticipationPermissions,
      personalParticipation,
      participations,
      refreshParticipants
    }
  },
  computed: {
    user() {
      return userStore.getState().user
    },
    eventAreaParticipants(): EventParticipationDto[] {
      return this.participations.filter(({ assigned_event_areas }) => {
        return assigned_event_areas.includes(this.eventArea.id!)
      })
    },
    isCampaignAdmin() {
      return userStore.isCampaignAdmin()
    },
    isUserEventAreaParticipant(): boolean {
      return (
        (this.user !== null &&
          this.personalParticipation?.assigned_event_areas.includes(
            this.eventArea.id!
          )) ??
        false
      )
    },
    onlyMemberParticipants(): EventParticipationDto[] {
      return this.participations.filter((item) => item.user_is_member)
    }
  },
  methods: {
    async joinArea() {
      if (this.personalParticipation) {
        this.personalParticipation = (
          await this.$apiClient.eventParticipations.assignEventArea(
            this.personalParticipation.id.toString(),
            this.eventArea.id!
          )
        ).payload.data
      }
    },
    async leaveArea() {
      if (this.personalParticipation) {
        this.personalParticipation = (
          await this.$apiClient.eventParticipations.unassignEventArea(
            this.personalParticipation.id.toString(),
            this.eventArea.id!
          )
        ).payload.data
      }
    },
    async updateAreaParticipations(participations: EventParticipationDto[]) {
      const participants = participations.map(({ user }) => user)
      const changedParticipations: EventParticipationDto[] = []

      try {
        for (const participation of this.participations) {
          if (
            participants.includes(participation.user) &&
            !participation.assigned_event_areas.includes(this.eventArea.id!)
          ) {
            changedParticipations.push(
              (
                await this.$apiClient.eventParticipations.patch(
                  participation.id.toString(),
                  {
                    assigned_event_areas: [
                      ...participation.assigned_event_areas,
                      this.eventArea.id!
                    ]
                  }
                )
              ).payload.data
            )
          } else if (
            !participants.includes(participation.user) &&
            participation.assigned_event_areas.includes(this.eventArea.id!)
          ) {
            changedParticipations.push(
              (
                await this.$apiClient.eventParticipations.patch(
                  participation.id.toString(),
                  {
                    assigned_event_areas:
                      participation.assigned_event_areas.filter(
                        (id) => id !== this.eventArea?.id
                      )
                  }
                )
              ).payload.data
            )
          }
        }
      } catch (e) {
        if (this.$apiClient.isApiClientError(e) && e.response?.status === 404) {
          this.$q.notify({
            message: 'Die gewählte Person ist nicht mehr Teil der Aktion',
            timeout: 2000,
            color: 'negative'
          })
          await this.refreshParticipants()
        } else {
          this.$q.notify({
            message:
              'Unbekannter fehler beim Aktualisieren der Teilnehmer*innen',
            timeout: 2000,
            color: 'negative'
          })
        }
      }
      this.updateParticipations(changedParticipations)
    },
    updateParticipations(updatedParticipations: EventParticipationDto[]) {
      this.participations = this.participations.map((item) => {
        const changedItem = updatedParticipations.find(
          ({ id }) => item.id === id
        )
        return changedItem ?? item
      })
    }
  }
})
</script>
<style lang="scss" scoped></style>
