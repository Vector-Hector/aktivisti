<template>
  <DrawControl
    ref="draw"
    :features="features"
    :controls="drawControls"
    :styles="routePlannerStyles"
    :display-controls-default="false"
    @update:features="() => {}"
    @draw:create="handleCreatedFeatures"
    @draw:update="handleCreatedFeatures"
    @draw:delete="handleDeletedFeatures"
  />
  <Marker
    :location="event.location"
  />
  <MapOverlay
    position="top-left"
    class="edit-routes-overlay"
  >
    <h2 class="headline">
      Gebiete zeichnen
    </h2>
    <p>
      Wähle nun mit dem Polygonwerkzeug auf der rechten Seite Gebiete aus um die verschiedenen Einsatzgebiete zu
      beschreiben
    </p>
    <QTable
      :auto-layout="true"
      flat
      :value="areas"
      :columns="columns"
      :rows="areas"
      virtual-scroll
      hide-pagination
      :rows-per-page-options="[0]"
      class="editable-cells-table overflow-hidden q-my-sm"
      edit-mode="cell"
      no-data-label="Noch keine Gebiete gezeichnet"
      @cell-edit-complete="updateArea($event.data)"
    >
      <template v-slot:body="props">
        <QTr>
          <QTd key="name" :props="props">
            <div>
              {{ props.row.name }}
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
            <span v-else>
            {{ props.row.area_details?.streets?.reduce((acc, item) => acc + item.addresses.length, 0) ?? 0 }}
          </span>
          </QTd>
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
          <QTd key="actions" :props="props">
            <QSpinnerPuff
              v-if="deletingAreaIds.has(props.row.id)"
            />
            <QBtn
              v-else
              dense
              size="sm"
              round
              flat
              color="negative"
              :icon="ionTrash"
              @click="deleteAreaByFeatureId(props.row.feature_id)"
            />
          </QTd>
        </QTr>
      </template>
    </QTable>
    <QBtn
      color="primary"
      class="add-area-button"
      :icon="ionCreateOutline"
      label="Gebiet zeichnen"
      @click="drawArea()"
    />
  </MapOverlay>
  <MapOverlay
    class="navigation-overlay"
    position="bottom-right"
  >
    <QBtn
      flat
      color="primary"
      @click="$router.go(-1)"
    >
      Zurück
    </QBtn>
    <QBtn
      color="primary"
      :to="{name: 'event-detail', params: { id: event.id }}"
      label="Fertig"
    />
  </MapOverlay>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import DrawControl from 'src/mapbox/DrawControl.vue'
import Marker from 'src/mapbox/Marker.vue'
import EditEventMixin from 'src/pages/edit-event/EditEventMixin'
import MapOverlay from 'src/components/MapOverlay.vue'
import { Feature } from 'geojson'
import { routePlannerStyles } from 'src/pages/edit-event/map/route-planner.styles'
import { EventAreaDto } from 'src/api/model/EventAreaDto'
import { apiClient } from 'src/api/ApiClient'
import {
  QBtn,
  QColor,
  QInput,
  QPopupEdit,
  QPopupProxy,
  QSpinnerPuff,
  QTable,
  QTd,
  QTr
} from 'quasar'
import { ionCreateOutline, ionTrash } from '@quasar/extras/ionicons-v5'

const defaultColors = [
  '#E22A3A',
  '#37FFFF',
  '#91BF77',
  '#F8AC60',
  '#8E197C',
  '#9E2B25',
  '#266DD3',
  '#FDE74C',
  '#55DBCB',
  '#495D63'
]

export default defineComponent({
  name: 'EditEventMapRoutes',
  components: {
    Marker,
    DrawControl,
    MapOverlay,
    QBtn,
    QTable,
    QTd,
    QTr,
    QPopupEdit,
    QColor,
    QSpinnerPuff,
    QInput,
    QPopupProxy
  },
  mixins: [EditEventMixin],
  beforeRouteEnter: async (to, from, next) => {
    if (to.params.id) {
      const response = await apiClient.eventAreas.list({
        event: to.params.id as string
      })
      next((vm: any) => {
        vm.areas = response.payload.data
      })
    } else {
      next()
    }
  },
  data() {
    return {
      routePlannerStyles: routePlannerStyles('#000000'),
      areas: [] as EventAreaDto[],
      updatingAreaFeatureIds: new Set<string>(),
      deletingAreaIds: new Set<string>(),
      drawControls: {
        polygon: true,
        trash: true
      },
      columns: [{
        name: 'name',
        label: 'Name',
        field: 'name',
        align: 'left'
      }, {
        name: 'details',
        label: 'Adressen',
        field: 'area_details'
      }, {
        name: 'color',
        label: 'Farbe',
        field: 'color',
        required: true
      }, {
        name: 'actions',
        label: 'Aktionen',
        field: null,
        required: true
      }],
      ionCreateOutline,
      ionTrash
    }
  },
  computed: {
    features(): Feature[] {
      return this.areas.map((area) => {
        return {
          type: 'Feature',
          geometry: area.geometry,
          id: area.feature_id,
          properties: {
            // find the corresponding area and copy the color
            color: area.color
          }
        }
      })
    }
  },
  methods: {
    async handleCreatedFeatures(event: any) {
      for (const feature of event.features) {
        const existingArea = this.areas.find((area) => area.feature_id === feature.id)
        const updatedArea = Object.assign(
          {
            name: `Gebiet ${this.areas.length + 1}`,
            color: defaultColors[this.areas.length] ?? defaultColors[0],
            event: this.event.id!
          },
          existingArea ?? {},
          {
            feature_id: feature.id,
            geometry: feature.geometry
          }
        )
        if (existingArea) {
          this.areas = this.areas.map((area) => {
            if (area.feature_id === updatedArea.feature_id) {
              return updatedArea as EventAreaDto
            } else {
              return area
            }
          })
          await this.updateArea(updatedArea)
        } else {
          this.areas.push(updatedArea as EventAreaDto)
          await this.updateArea(updatedArea)
        }
      }
    },
    handleDeletedFeatures(event: any) {
      const deletedFeatureIds = event.features.map(({id}: { id: string }) => id)
      for (const featureId of deletedFeatureIds) {
        void this.deleteAreaByFeatureId(featureId)
      }
    },
    async updateArea(area: Partial<EventAreaDto>) {
      this.updatingAreaFeatureIds.add(area.feature_id!)
      let updatedArea: EventAreaDto
      if (area.id) {
        updatedArea = (await apiClient.eventAreas.update(area.id.toString(), area as EventAreaDto)).payload.data
      } else {
        updatedArea = (await apiClient.eventAreas.create(area)).payload.data
      }
      this.areas = this.areas.map((item) => {
        if (item.feature_id === updatedArea.feature_id) {
          return updatedArea
        } else {
          return item
        }
      })
      this.updatingAreaFeatureIds.delete(updatedArea.feature_id)
    },
    async deleteAreaByFeatureId(deleteId: string) {
      const area = this.areas.find(({feature_id}) => feature_id === deleteId)
      if (area?.id) {
        try {
          this.deletingAreaIds.add(deleteId)
          await apiClient.eventAreas.delete(area.id.toString())
          this.areas = this.areas.filter(({id}) => area?.id !== id)
        } catch (e) {
          this.$q.notify({
            message: 'Etwas ging schief beim löschen des Gebiets',
            color: 'negative',
            timeout: 3000
          })
        } finally {
          this.deletingAreaIds.delete(deleteId)
        }
      }
      this.areas = this.areas.filter(({feature_id}) => deleteId !== feature_id)
    },
    drawArea() {
      (this.$refs.draw as typeof DrawControl).changeMode('draw_polygon')
    }
  }
})
</script>

<style lang="scss" scoped>
@import "src/css/_variables.scss";

Button {
  a {
    color: $white;
    text-decoration: none;
  }
}

.submit-button {
  margin-left: 1rem;
}

.edit-routes-overlay {
  width: 38%;
  max-width: 750px;
  display: flex;
  flex-direction: column;
}

.progress-spinner {
  width: 2rem;
  height: 2rem;
}

.cell-input {
  width: 100%;
}

.add-area-button {
  width: 100%;
}

.headline {
  margin: 0.5rem 0;
  font-size: 1.5rem;
  line-height: 2rem;
  font-weight: bold;
}

</style>
