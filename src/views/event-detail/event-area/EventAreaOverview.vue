<template>
  <IonGrid
    class="w-100 p-m-0"
  >
    <IonRow>
      <IonCol>
        <IonItem v-if="areaPermissions?.self?.PATCH">
          <IonLabel class="participant-select-label">
            Teilnehmer
          </IonLabel>
          <IonSelect
            :value="eventAreaParticipants"
            :multiple="true"
            class="participant-select"
            @ionChange="updateAreaParticipations"
          >
            <IonSelectOption
              v-for="participation in onlyMemberParticipants"
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
            v-if="isUserEventAreaParticipant"
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
      </IonCol>
      <IonCol
        v-if="areaPermissions?.self?.PATCH"
        size="auto"
      >
        <IonButton
          fill="none"
          :class="{ 'button-success': eventArea.is_completed }"
          @click="openCompletionModal"
        >
          <IonIcon
            name="checkmark-circle-outline"
          />
        </IonButton>
      </IonCol>
    </IonRow>
    <IonRow>
      <IonList class="address-list">
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
    </IonRow>
  </IonGrid>
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
  IonRow,
  IonCol,
  IonGrid,
  IonSelect,
  IonSelectOption,
  toastController,
  alertController
} from '@ionic/vue'
import EventAreaMixin from '@/views/event-detail/event-area/EventAreaMixin'
import { userStore } from '@/store/UserStore'
import { EventParticipationDto } from '@/api/model/EventParticipationDto'
import { isEqual } from 'lodash-es'
import { uiStore } from '@/store/UiStore'
import { addIcons } from 'ionicons'
import { checkmarkCircleOutline } from 'ionicons/icons'

addIcons({
  'checkmark-circle-outline': checkmarkCircleOutline
})

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
    IonButtons,
    IonGrid,
    IonRow,
    IonCol
  },
  mixins: [EventAreaMixin],
  beforeRouteEnter: async (to, from, next) => {
    next(vm => {
      uiStore.updateActiveElements({
        // @ts-ignore
        eventArea: vm.eventArea.name
      })
    })
  },
  props: {
    participations: {
      type: Array as PropType<EventParticipationDto[]>,
      required: true
    }
  },
  emits: ['update:participations', 'update:eventArea'],
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
    isUserEventAreaParticipant(): boolean {
      return (
        this.user !== null
        && this.participations.find((participation) => participation.user === this.user!.id)?.assigned_event_areas.includes(this.eventArea.id!)
      ) ?? false
    },
    onlyMemberParticipants(): EventParticipationDto[] {
      return this.participations.filter(item => item.user_is_member)
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
    async openCompletionModal() {
      const confirmationAlert = await alertController
        .create({
          header: 'Aktionsgebiet erledigt',
          message: this.eventArea.is_completed
            ? `Das Aktionsgebiet ${this.eventArea.id} als <b>offen</b> markieren?`
            : `Das Aktionsgebiet ${this.eventArea.id} als <b>erledigt</b> markieren?`,
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
              cssClass: 'secondary'
            },
            {
              text: 'Okay',
              handler: () => {
                this.$apiClient.eventAreas.patch(this.eventArea!.id!.toString(), {
                  is_completed: !this.eventArea.is_completed
                })
                  .then((response) => {
                    this.$emit('update:eventArea', response.payload.data)
                  })
                  .catch((e) => {
                    toastController.create({
                      position: 'bottom',
                      color: 'danger',
                      header: `Fehlercode: ${e.status}`,
                      message: 'Das Aktionsgebiet konnte nicht aktualisiert werden',
                      duration: 2000
                    })
                  })
              }
            }
          ]
        })
      await confirmationAlert.present()
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

.address-list {
  width: 100%;
  flex: 1 1 100%;
}

.button-success {
  color: $successButtonBg;
}
</style>
