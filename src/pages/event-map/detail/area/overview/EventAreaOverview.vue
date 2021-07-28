<template>
  <QScrollArea
    class="d-flex flex-fill">
    <div class="container q-gutter-y-md">
      <div class="row q-col-gutter-x-md">
        <div class="col">
          <AssignAreaParticipants />
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
  </QScrollArea>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { userStore } from 'src/store/UserStore'
import { EventParticipationDto } from 'src/api/model/EventParticipationDto'
import { uiStore } from 'src/store/UiStore'
import EventDetailStoreMixin from 'pages/event-map/detail/EventDetailStoreMixin'
import { QBtn, QIcon, QItem, QItemLabel, QItemSection, QList, QScrollArea, QSelect } from 'quasar'
import { ionCheckmarkCircle, ionCheckmarkCircleOutline, ionChevronForward } from '@quasar/extras/ionicons-v5'
import { StreetDetails } from 'src/api/model/AreaDetailsDto'
import { difference } from 'lodash-es'
import { eventDetailStore } from 'src/store/EventDetailStore'
import AssignAreaParticipants from 'pages/event-map/detail/area/AssignAreaParticipants.vue'


export default defineComponent({
  name: 'EventAreaOverview',
  components: {
    AssignAreaParticipants,
    QList,
    QItem,
    QItemSection,
    QItemLabel,
    QIcon,
    QBtn,
    QScrollArea
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
  methods: {
    streetCompleted(street: StreetDetails) {
      return difference(street.addresses.map(({osm_id}) => osm_id), this.completedTargetIds).length === 0
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
          eventDetailStore.updateEventArea(response.payload.data)
        } catch (error) {
          void this.$q.notify({
            position: 'bottom',
            message: 'Das Aktionsgebiet konnte nicht aktualisiert werden',
            color: 'negative',
            timeout: 2000
          })
        }
      })
    }
  }
})
</script>

<style lang="scss" scoped>
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
  color: #4CAF50;
}

.complete-button {
  display: flex;
  align-items: center;
}

.finished-icon {
  margin-right: 1rem;
  color: #4CAF50;
}

.item-icon {
  height: 24px;
}
</style>
