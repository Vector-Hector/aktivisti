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
    <DataTable
      :auto-layout="true"
      :value="areas"
      class="editable-cells-table p-datatable-sm"
      edit-mode="cell"
      @cell-edit-complete="updateArea($event.data)"
    >
      <Column
        header="Name"
        field="name"
        body-class="name-cell"
      >
        <template
          #editor="slotProps"
        >
          <InputText
            v-if="slotProps.data.id"
            v-model="slotProps.data[slotProps.column.props.field]"
            class="cell-input"
          />
        </template>
      </Column>
      <Column
        field="addressCount"
        header="Adressen"
        header-class="address-cell"
        body-class="address-cell"
      >
        <template #body="slotProps">
          <ProgressSpinner
            v-if="updatingAreaFeatureIds.has(slotProps.data.feature_id)"
            class="progress-spinner"
          />
          <span v-else>
            {{ slotProps.data.area_details?.streets?.reduce((acc, item) => acc + item.addresses.length, 0) ?? 0 }}
          </span>
        </template>
      </Column>
      <Column
        header="Farbe"
      >
        <template #body="slotProps">
          <ColorPicker
            :model-value="slotProps.data.color.replace('#', '')"
            @update:modelValue="slotProps.data.color = `#${$event}`; updateArea(slotProps.data)"
          />
        </template>
      </Column>
      <Column
        header=""
      >
        <template #body="slotProps">
          <ProgressSpinner
            v-if="deletingAreaIds.has(slotProps.data.id)"
            class="progress-spinner"
          />
          <Button
            v-else
            class="p-button-danger"
            icon="pi pi-trash"
            @click="deleteAreaById(slotProps.data.id)"
          />
        </template>
      </Column>
      <template #empty>
        Noch keine Gebiete gezeichnet
      </template>
      <template #footer>
        <Button
          class="add-area-button"
          icon="pi pi-share-alt"
          label="Gebiet zeichnen"
          @click="drawArea()"
        />
      </template>
    </DataTable>
  </MapOverlay>
  <MapOverlay
    class="navigation-overlay"
    position="bottom-right"
  >
    <Button
      class="gray-button"
      @click="$router.go(-1)"
    >
      Zurück
    </Button>
    <router-link
      v-slot="{ href, navigate }"
      custom
      :to="{name: 'event-detail', params: { id: event.id }}"
    >
      <Button
        class="submit-button"
        @click="navigate"
      >
        <a :href="href">
          Fertig</a>
      </Button>
    </router-link>
  </MapOverlay>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import DrawControl from 'src/mapbox/DrawControl.vue'
import Marker from 'src/mapbox/Marker.vue'
import EditEventMixin from 'src/pages/edit-event/EditEventMixin'
import MapOverlay from 'src/components/MapOverlay.vue'
import Button from 'primevue/button'
import { Feature } from 'geojson'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ColorPicker from 'primevue/colorpicker'
import ProgressSpinner from 'primevue/progressspinner'
import { routePlannerStyles } from 'src/pages/edit-event/map/route-planner.styles'
import InputText from 'primevue/inputtext'
import { EventAreaDto } from 'src/api/model/EventAreaDto'
import { apiClient } from 'src/api/ApiClient'

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
    Button,
    Marker,
    DrawControl,
    MapOverlay,
    DataTable,
    Column,
    ColorPicker,
    ProgressSpinner,
    InputText
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
      deletingAreaIds: new Set<number>(),
      drawControls: {
        polygon: true,
        trash: true
      }
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
      const deletedIds = event.features.map(({id}: { id: string }) => id)
      this.areas = this.areas.filter(({id}) => {
        return !deletedIds.includes(id)
      })
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
    async deleteAreaById(deleteId: number) {
      const area = this.areas.find(({id}) => id === deleteId)
      this.deletingAreaIds.add(deleteId)
      if (area?.id) {
        await apiClient.eventAreas.delete(area.id.toString())
      }
      this.areas = this.areas.filter(({id}) => area?.id !== id)
      this.deletingAreaIds.delete(deleteId)
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
  width: 35%;
  max-width: 750px;
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

:deep(.p-datatable-auto-layout > .p-datatable-wrapper) {
  overflow: visible;
}

:deep(.address-cell) {
  text-align: center !important;
}

:deep(.name-cell) {
  width: 100%;
}

.headline {
  margin: 0.5rem 0;
  font-size: 1.5rem;
  line-height: 2rem;
  font-weight: bold;
}

</style>
