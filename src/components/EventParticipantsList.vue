<template>
  <div class="row">
    <div class="col">
      <QList v-if="verifiedParticipations.length > 0">
        <QItem
          v-for="participation in verifiedParticipations"
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
              <QBtn
                fill="none"
                size="md"
                :icon="ionClose"
                dense
                flat
                round
                @click="deleteParticipation(participation.id)"

                aria-label="Nutzer von der Aktion entfernen"
              />
            </div>
          </QItemSection>

        </QItem>
      </QList>
      <QList v-if="notVerifiedParticipations.length > 0">
        <QToolbarTitle>Teilnehmer*innen bestätigen</QToolbarTitle>
        <QItem
          v-for="participation in notVerifiedParticipations"
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
              <QBtn
                fill="none"
                size="md"
                dense
                flat
                round
                aria-label="Nutzer von der Aktion entfernen"
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
import { ionClose, ionCheckmark } from '@quasar/extras/ionicons-v5'
import { QBtn, QItem, QItemLabel, QItemSection, QList, QToolbarTitle } from 'quasar'

export default defineComponent({
  name: 'EventParticipantsList',
  components: {
    QList,
    QItem,
    QItemLabel,
    QItemSection,
    QBtn,
    QToolbarTitle
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
      participations: [] as EventParticipationDto[],
      ionClose,
      ionCheckmark
    }
  },
  computed: {
    verifiedParticipations(): EventParticipationDto[] {
      return this.participations.filter((item) => item.is_verified)
    },
    notVerifiedParticipations(): EventParticipationDto[] {
      return this.participations.filter((item) => !item.is_verified)
    }
  },
  async created() {
    this.participations = (await
      this.$apiClient.eventParticipations.list(
        {
          event: this.eventId,
          is_pending_invitation: false
        })).payload.data
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
    }

  }
})
</script>

<style scoped>

</style>
