<template>
  <div class="edit-event-geometry container">
    <div class="location-select">
      <h2 class="headline">
        {{ locationHeadline }}
      </h2>
      <LocationSelect
        v-model:location="event.location"
        v-model:location-description="event.location_description"
        :error="errors.location?.[0]"
      />
    </div>
    <template v-if="event.event_type !== EventTypes.GENERIC">
      <div class="area-drawing">
        <h2 class="headline">
          Gebiete
        </h2>
        <QTable
          :auto-layout="true"
          flat
          dense
          :value="eventAreas"
          :columns="columns"
          :rows="eventAreas"
          virtual-scroll
          hide-pagination
          :rows-per-page-options="[0]"
          class="editable-cells-table overflow-hidden q-my-sm"
          edit-mode="cell"
          no-data-label="Noch keine Gebiete gezeichnet"
          @cell-edit-complete="updateArea($event.data)"
        >
          <template v-slot:header="props">
            <QTr :props="props">
              <QTh
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                class="table-header"
              >
                {{ col.label }}
              </QTh>
            </QTr>
          </template>
          <template v-slot:body="props">
            <QTr>
              <QTd key="color" :props="props">
                <QBtn
                  unelevated
                  round
                  dense
                  size="sm"
                  :style="{
              'background-color': props.row.color
            }"
                  :color="props.row.color"
                >
                  <QPopupProxy>
                    <QColor
                      no-header
                      no-footer
                      default-view="palette"
                      :model-value="props.row.color"
                      @update:modelValue="props.row.color = `${$event}`; updateArea(props.row)"
                    />
                  </QPopupProxy>
                </QBtn>
              </QTd>
              <QTd key="name" :props="props">
                <div>
                  {{ props.row.name }}
                  <QBtn
                    :icon="ionPencil"
                    flat
                    round
                    dense
                    size="sm"
                    color="grey-6"
                  />
                  <QPopupEdit
                    v-model="props.row.name"
                    @save="(value) => updateArea({ ...props.row, name: value })"
                    :auto-save="true"
                    v-slot="scope"
                  >
                    <QInput v-model="scope.value" @keyup.enter="scope.set" dense autofocus />
                  </QPopupEdit>
                </div>
              </QTd>
              <QTd key="details" :props="props">
                <QSpinnerPuff
                  v-if="updatingAreaFeatureIds.has(props.row.feature_id)"
                  class="progress-spinner"
                />
                <span v-else-if="event.event_type === EventTypes.POSTERS">
              {{ props.row.poster_count }}
            </span>
                <span v-else>
              {{ props.row.area_details?.streets?.reduce((acc, item) => acc + item.addresses.length, 0) ?? 0 }}
            </span>
              </QTd>

              <QTd key="actions" :props="props">
                <QSpinnerPuff
                  v-if="deletingAreaIds.has(props.row.id)"
                />
                <QBtn
                  v-else
                  dense
                  round
                  flat
                  color="grey-6"
                  :icon="ionTrash"
                  @click="deleteAreaByFeatureId(props.row.feature_id)"
                />
              </QTd>
            </QTr>
          </template>
        </QTable>
        <div class="buttons">
          <QBtn
            :icon="ionCopyOutline"
            dense
            size="md"
            label="Gebiete übernehmen"
            @click="openAdoptAreasModal"
          />
          <QBtn
            color="primary"
            class="add-area-button"
            :icon="ionShareSocial"
            dense
            size="md"
            label="Gebiet zeichnen"
            @click="startDrawArea"
          />
        </div>
      </div>
    </template>
  </div>
  <SidebarBottomStepNavigation
    @close="abort"
    @forward="next"
    @back="back"
    :last="stepControls.isLastStep.value"
  />
</template>

<script lang="ts">
import { defineComponent, inject } from 'vue'
import {
  QBtn,
  QColor,
  QInput,
  QPopupEdit,
  QPopupProxy, QSpinnerPuff,
  QTable,
  QTd, QTh,
  QTr
} from 'quasar'
import { ionCopyOutline, ionPencil, ionShareSocial, ionTrash } from '@quasar/extras/ionicons-v5'
import EditEventGeometryMixin from 'pages/edit-event/geometry/EditEventGeometryMixin'
import SidebarBottomStepNavigation from 'components/SidebarBottomStepNavigation.vue'
import EditEventAutoSaveMixin from 'pages/edit-event/EditEventAutoSaveMixin'
import { EditEventBus, START_DRAW_AREA } from 'src/store/EditEventStore'
import { StepControls } from 'pages/EditEvent.vue'
import LocationSelect from 'components/LocationSelect.vue'
import { EventTypes } from 'src/api/model/EventTypes'
import AdoptEventAreas from 'components/modals/AdoptEventAreas.vue'
import { EventAreaDto } from 'src/api/model/EventAreaDto'
import { apiClient } from 'src/api/ApiClient'

export default defineComponent({
  name: 'EditEventGeometry',
  components: {
    LocationSelect,
    SidebarBottomStepNavigation,
    QPopupEdit,
    QColor,
    QSpinnerPuff,
    QPopupProxy,
    QBtn,
    QInput,
    QTable,
    QTd,
    QTr,
    QTh
  },
  mixins: [EditEventGeometryMixin, EditEventAutoSaveMixin],
  setup() {
    return {
      stepControls: inject('stepControls') as StepControls
    }
  },
  data() {
    return {
      loading: false,
      ionCopyOutline,
      ionShareSocial,
      ionTrash,
      ionPencil,
      EventTypes
    }
  },
  computed: {
    locationHeadline(): string {
      if (this.event.event_type === EventTypes.GENERIC) {
        return 'Veranstaltungsort'
      } else {
        return 'Treffpunkt'
      }
    },
    columns() {
      let detailsColumns
      if (this.event.event_type === EventTypes.POSTERS) {
        detailsColumns = {
          name: 'details',
          label: 'Plakate'
        }
      } else {
        detailsColumns = {
          name: 'details',
          label: 'Adressen'
        }
      }
      return [{
        name: 'color',
        label: 'Farbe',
        field: 'color',
        align: 'left',
        required: true
      }, {
        name: 'name',
        label: 'Name',
        field: 'name',
        align: 'left'
      }, detailsColumns, {
        name: 'actions',
        label: '',
        field: null,
        required: true
      }]
    }
  },
  methods: {
    startDrawArea() {
      EditEventBus.emit(START_DRAW_AREA)
    },
    async back() {
      await this.saveDebouncer.waitForSettle()
      this.stepControls.previous()
    },
    async next() {
      await this.saveDebouncer.waitForSettle()
      if (!this.event.location) {
        this.$q.notify({
          color: 'negative',
          message: 'Bitte gebe einen gültigen Treffpunkt an.'
        })
      } else {
        this.stepControls.next()
      }
    },
    async abort() {
      await this.saveDebouncer.waitForSettle()
      this.stepControls.abort()
    },
    openAdoptAreasModal() {
      this.$q.dialog({
        component: AdoptEventAreas,
      }).onOk(async (eventAreas: EventAreaDto[])=>  {
        eventAreas = eventAreas.map((area) => ({
          ...area,
          event: this.event.id
        }))

        const eventAreaDeletionPromise: Promise<any>[] = []
        for (const oldArea of this.eventAreas){
          eventAreaDeletionPromise.push(apiClient.eventAreas.delete(oldArea.id!.toString()))
        }
        await Promise.all(eventAreaDeletionPromise)
        this.eventAreas = []

        const eventAreaCreationPromise: Promise<any>[] = []
        for (const area of eventAreas) {
          eventAreaCreationPromise.push(apiClient.eventAreas.create(area))
        }
        const responses = await Promise.all(eventAreaCreationPromise)
        responses.forEach((response)=> this.eventAreas.push(response.payload.data)
        )
      })
    }
  }
})
</script>

<style lang="scss" scoped>
@import "src/css/quasar.variables";

.buttons {
  display: flex;
  flex-direction: row;
  justify-content: center;

  * {
    margin-left: 1rem;
    flex-grow: 1;
  }
}

.edit-event-geometry {
  flex: 1;
  padding: 0.5rem;
  overflow: auto;
}

.location-description {
  width: 100%
}

.headline {
  margin: 0.5rem 0 0 0;
  font-size: 1.5rem;
  line-height: 2rem;
  font-weight: bold;
}

.location-select {
  display: flex;
  flex-direction: column;
  margin: 1rem;
}

.area-drawing {
  display: flex;
  flex-direction: column;
  margin: 0 1rem;
}

.table-header {
  background: $grey-3;
}
</style>
