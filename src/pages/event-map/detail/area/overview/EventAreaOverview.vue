<template>
  <div class="container q-gutter-y-md">
    <div class="row q-col-gutter-x-md">
      <div class="col">
        <QSelect
          v-if="eventAreaPermissions?.self?.PATCH"
          :model-value="eventAreaParticipants"
          @update:model-value="updateAreaParticipations($event)"
          :multiple="true"
          label="Teilnehmer*innen"
          :options="onlyMemberParticipants"
          option-label="user_username"
          :display-value="eventAreaParticipants.map(({user_username}) => user_username).join(',')"
        />
        <div
          v-else-if="isUserEventParticipant"
          class="join-buttons"
        >
          <QBtn
            v-if="isUserEventAreaParticipant"
            @click="leaveArea"
            flat
          >
            Doch nicht hier mitmachen
          </QBtn>
          <QBtn
            v-else
            color="primary"
            @click="joinArea"
          >
            In diesem Gebiet mitmachen
          </QBtn>
        </div>
      </div>
      <div class="col-grow complete-button"
           v-if="eventAreaPermissions?.self?.PATCH"
      >
        <QBtn
          outline
          dense
          round
          flat
          :class="{
            'button-success': eventArea.is_completed
          }"
          @click="openCompletionModal"
          :icon="ionCheckmarkCircleOutline"
        />
      </div>
    </div>
    <div class="row">
      <QList class="address-list">
        <QItem
          v-for="street in eventArea.area_details.streets"
          :key="street.name"
          :clickable="true"
          :to="{ name: 'event-detail-area-street', params: { street: street.name } }"
        >
          <QItemSection>
            <QItemLabel>
              {{ street.name }}
            </QItemLabel>
            <QItemLabel>
              {{ street.addresses.length }} Adressen
            </QItemLabel>
          </QItemSection>

          <QItemSection side>
            <div class="row">
              <QIcon
                v-if="streetCompleted(street)"
                class="col finished-icon item-icon"
                :name="ionCheckmarkCircle"
              />
              <QIcon
                class="col item-icon"
                :name="ionChevronForward"
              />
            </div>
          </QItemSection>
        </QItem>
      </QList>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { userStore } from 'src/store/UserStore'
import { EventParticipationDto } from 'src/api/model/EventParticipationDto'
import { uiStore } from 'src/store/UiStore'
import EventDetailStoreMixin from 'pages/event-map/detail/EventDetailStoreMixin'
import { QBtn, QIcon, QItem, QItemLabel, QItemSection, QList, QSelect } from 'quasar'
import { ionCheckmarkCircle, ionCheckmarkCircleOutline, ionChevronForward } from '@quasar/extras/ionicons-v5'
import Timeout = NodeJS.Timeout
import { eventDetailStore } from 'src/store/EventDetailStore'
import { StreetDetails } from 'src/api/model/AreaDetailsDto'
import { difference } from 'lodash-es'


export default defineComponent({
  name: 'EventAreaOverview',
  components: {
    QList,
    QItem,
    QItemSection,
    QItemLabel,
    QIcon,
    QSelect,
    QBtn
  },
  mixins: [EventDetailStoreMixin],
  beforeRouteEnter(to, from, next) {
    next(vm => {
      uiStore.updateActiveElements({
        // @ts-ignore
        eventArea: vm.eventArea.name
      })
    })
  },
  data() {
    return {
      ionChevronForward,
      ionCheckmarkCircleOutline,
      ionCheckmarkCircle
    }
  },
  computed: {
    isCampaignAdmin() {
      return userStore.isCampaignAdmin()
    },
    isUserEventParticipant(): boolean {
      return this.user !== null && this.personalParticipation?.is_pending_invitation === false
    },
    isUserEventAreaParticipant(): boolean {
      return (
        this.user !== null
        && this.personalParticipation?.assigned_event_areas.includes(this.eventArea.id!)
      ) ?? false
    },
    onlyMemberParticipants(): EventParticipationDto[] {
      return this.participations.filter(item => item.user_is_member)
    },
    user() {
      return userStore.getState().user
    },
    eventAreaParticipants(): EventParticipationDto[] {
      return this.participations.filter(({assigned_event_areas}) => {
        return assigned_event_areas.includes(this.eventArea.id!)
      })
    }
  },
  methods: {
    streetCompleted(street: StreetDetails) {
      return difference(street.addresses.map(({osm_id}) => osm_id), this.completedTargetIds).length === 0
    },
    async joinArea() {
      if (this.personalParticipation) {
        this.personalParticipation = (await this.$apiClient.eventParticipations.patch(this.personalParticipation.id.toString(), {
          assigned_event_areas: [...this.personalParticipation.assigned_event_areas, this.eventArea.id!]
        })).payload.data
      }
    },
    async leaveArea() {
      if (this.personalParticipation) {
        this.personalParticipation = (await this.$apiClient.eventParticipations.patch(this.personalParticipation.id.toString(), {
          assigned_event_areas: this.personalParticipation.assigned_event_areas.filter((id) => id !== this.eventArea.id)
        })).payload.data
      }
    },
    updateParticipations(updatedParticipations: EventParticipationDto[]) {
      this.participations = this.participations.map((item) => {
        const changedItem = updatedParticipations.find(({id}) => item.id === id)
        return changedItem ?? item
      })
    },
    openCompletionModal() {
      this.$q.dialog({
        title: 'Aktionsgebiet erledigt',
        message: this.eventArea.is_completed
          ? `Das Aktionsgebiet <b>${this.eventArea.name}</b> als <b>offen</b> markieren?`
          : `Das Aktionsgebiet <b>${this.eventArea.name}</b> als <b>erledigt</b> markieren?`,
        html: true,
        cancel: true,
        persistent: true
      }).onOk(async () => {
        try {
          const response = await this.$apiClient.eventAreas.patch(this.eventArea.id!.toString(), {
            is_completed: !this.eventArea.is_completed
          })
          this.eventArea = response.payload.data
        } catch (error) {
          void this.$q.notify({
            position: 'bottom',
            multiLine: true,
            message: '<h5>Fehlercode: ${e.response?.status}</h5>Das Aktionsgebiet konnte nicht aktualisiert werden',
            color: 'danger',
            html: true,
            timeout: 2000
          })
        }
      })
    },
    async updateAreaParticipations(participations: EventParticipationDto[]) {
      const participants = participations.map(({user}) => user)
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
        this.$q.notify({
          message: `<h5>Fehlercode: ${e.status}<h5>Die Teilnehmer konnten nicht aktualisiert werden`,
          html: true,
          timeout: 2000,
          color: 'danger'
        })
      }
      this.updateParticipations(changedParticipations)
    }
  }
})
</script>

<style lang="scss" scoped>
@import "src/css/_globals.scss";

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

.complete-button {
  display: flex;
  align-items: center;
}

.finished-icon {
  margin-right: 1rem;
  color: $successButtonBg;
}

.item-icon {
  height: 24px;
}
</style>
