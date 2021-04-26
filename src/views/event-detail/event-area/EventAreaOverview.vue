<template>
  <IonItem v-if="isCampaignAdmin">
    <IonLabel class="participant-select-label">
      Teilnehmer
    </IonLabel>
    <IonSelect
      v-if="isCampaignAdmin"
      :value="eventAreaParticipants"
      :multiple="true"
      class="participant-select"
      @ionChange="updateAreaParticipations"
    >
      <IonSelectOption
        v-for="participation in participations"
        :key="participation.id"
        :value="participation.user"
      >
        {{ participation.user_username }}
      </IonSelectOption>
    </IonSelect>
  </IonItem>
  <IonButtons
    v-else-if="isUserEventParticipant"
    class="join-buttons"
  >
    <IonButton
      v-if="participations.find((participation) => participation.user === user.id)?.assigned_event_areas.includes(eventArea.id)"
      @click="leaveArea"
    >
      Doch nicht hier mitmachen
    </IonButton>
    <IonButton
      v-else
      color="primary"
      fill="solid"
      @click="joinArea"
    >
      In diesem Gebiet mitmachen
    </IonButton>
  </IonButtons>
  <IonList>
    <IonItem
      v-for="street in eventArea.area_details.streets"
      :key="street.name"
      :button="true"
      @click="$router.push({ name: 'event-detail-area-street', params: { street: street.name } })"
    >
      <IonLabel>
        <h3>{{ street.name }}</h3>
        <p>{{ street.addresses.length }} Adressen</p>
      </IonLabel>
      <IonIcon
        slot="end"
        class="chevron"
        name="chevron-forward"
      />
    </IonItem>
  </IonList>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import {
  IonButton,
  IonButtons,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonSelect,
  IonSelectOption,
  toastController
} from '@ionic/vue'
import EventAreaMixin from '@/views/event-detail/event-area/EventAreaMixin'
import { userStore } from '@/store/UserStore'
import { EventParticipationDto } from '@/api/model/EventParticipationDto'
import { isEqual } from 'lodash-es'

export default defineComponent({
  name: 'EventAreaOverview',
  components: {
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonButtons
  },
  mixins: [EventAreaMixin],
  props: {
    participations: {
      type: Array as PropType<EventParticipationDto[]>,
      required: true
    }
  },
  emits: ['update:participations'],
  data() {
    return {
      eventAreaParticipants: [] as number[]
    }
  },
  computed: {
    isCampaignAdmin() {
      return userStore.isManager()
    },
    isUserEventParticipant(): boolean {
      return this.user !== null && this.participations.map((item) => item.user).includes(this.user.id)
    },
    user() {
      return userStore.getState().user
    }
  },
  watch: {
    participations: {
      handler() {
        this.refreshEventAreaParticipants()
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    refreshEventAreaParticipants() {
      const newParticipants = this.participations.filter(({assigned_event_areas}) => {
        return assigned_event_areas.includes(this.eventArea.id!)
      }).map(({user}) => user)
      if (!isEqual(this.eventAreaParticipants, newParticipants)) {
        this.eventAreaParticipants = newParticipants
      }
    },
    async joinArea() {
      const userParticipation = this.participations.find(({user}) => user === this.user!.id)
      if (userParticipation) {
        const updatedParticipation = await this.$apiClient.eventParticipations.patch(userParticipation.id.toString(), {
          assigned_event_areas: [...userParticipation.assigned_event_areas, this.eventArea.id!]
        })
        this.updateParticipations([updatedParticipation.payload.data])
      }
    },
    async leaveArea() {
      const userParticipation = this.participations.find(({user}) => user === this.user!.id)
      if (userParticipation) {
        const updatedParticipation = await this.$apiClient.eventParticipations.patch(userParticipation!.id.toString(), {
          assigned_event_areas: userParticipation.assigned_event_areas.filter((id) => id !== this.eventArea.id)
        })
        this.updateParticipations([updatedParticipation.payload.data])
      }
    },
    updateParticipations(updatedParticipations: EventParticipationDto[]) {
      this.$emit('update:participations', this.participations.map((item) => {
        const changedItem = updatedParticipations.find(({id}) => item.id === id)
        return changedItem ?? item
      }))
    },
    async updateAreaParticipations(event: any) {
      const participants = event.target!.value as number[]
      const changedParticipations: EventParticipationDto[] = []
      try {
        for (const participation of this.participations) {
          if (
            participants.includes(participation.user) &&
            !participation.assigned_event_areas.includes(this.eventArea.id!)
          ) {
            changedParticipations.push(
              (await this.$apiClient.eventParticipations.patch(participation.id.toString(), {
                assigned_event_areas: [...participation.assigned_event_areas, this.eventArea.id!]
              })).payload.data
            )
          } else if (
            !participants.includes(participation.user) &&
            participation.assigned_event_areas.includes(this.eventArea.id!)
          ) {
            changedParticipations.push(
              (await this.$apiClient.eventParticipations.patch(participation.id.toString(), {
                assigned_event_areas: participation.assigned_event_areas.filter((id) => id !== this.eventArea.id)
              })).payload.data
            )
          }
        }
      } catch (e) {
        const toast = await toastController.create({
          position: 'bottom',
          color: 'danger',
          header: `Fehlercode: ${e.status}`,
          message: 'Die Teilnehmer konnten nicht aktualisiert werden',
          duration: 2000
        })
        await toast.present()
      }
      this.updateParticipations(changedParticipations)
    }
  }
})

</script>

<style lang="scss" scoped>
@import "~@/scss/_globals.scss";

label {
  text-align: left;
}

.campaign {
  font-weight: bold;
  display: block;
}

.map {
  min-height: 180px;
  margin-bottom: 1.5em;
}

.button-group {
  margin-top: 1.5em;
}

.event-name {
  font-weight: bold;
  font-size: 1rem;
}

.participant-select-label {
  font-weight: bold;
}

.participant-select {
  max-width: 70%;
}

.full-width {
  width: 100%;
}

.join-buttons {
  margin: 0.5rem 0 0;
  display: flex;
  justify-content: center;
}

</style>
