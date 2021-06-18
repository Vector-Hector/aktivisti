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
      </QList>
      <QList v-if="notVerifiedParticipations.length > 0">
        <QToolbarTitle>Interessent*innen bestättigen:</QToolbarTitle>
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
              <QIcon
                fill="none"
                @click="verifyParticipation(participation.id)"
              >
                <QIcon
                  :name="ionCheckmark"
                  aria-label="Nutzer bestättigen"
                />
              </QIcon>
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
import { QIcon, QItem, QItemLabel, QItemSection, QList } from 'quasar'


export default defineComponent({
  name: 'EventParticipantsList',
  components: {
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
      await this.$apiClient.eventParticipations.verifyParticipant(participationId.toString())
    }

  }
})
</script>

<style scoped>

</style>
