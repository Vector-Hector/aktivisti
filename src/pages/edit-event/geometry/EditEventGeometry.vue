<template>
  <div class="edit-event-geometry container">
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
    <QBtn
      color="primary"
      class="add-area-button"
      :icon="ionShareSocial"
      dense
      size="md"
      label="Gebiet zeichnen"
      @click="startDrawArea"
    />
    <div class="location-select">
      <h2 class="headline">
        Treffpunkt
      </h2>
      <p>Bitte geben Sie entweder eine Adresse in das Suchfeld ein oder klicken Sie auf die Schaltfläche mit dem Pin und
        anschließend auf den gewünschten Ort auf der Karte, um einen Treffpunkt festzulegen.</p>
      <div class="row">
        <div class="col">
          <StandaloneGeocoder
            :standalone="true"
            @result="handleResult($event)"
          />
        </div>
        <div
          v-if="event.location === null"
          class="col-auto marker-column"
        >
          <DraggableMarker
            class="draggable-marker"
            @dropped="handleDropped"
          />
        </div>
      </div>
      <div class="row">
        <div class="col">
          <label for="locationDescription">Beschreibung</label>
          <QInput
            id="locationDescription"
            class="location-description"
            ref="descriptionInput"
            v-model="event.location_description"
            type="text"
            dense
            filled
            @keydown="touched = true"
          />
          <QPopupProxy
            no-parent-event
            ref="qPopupProxy"
          >
            <QCard>
              <QCardSection>
                  <span>
                    Wollen sie die Beschreibung für diesen Ort übernehmen?
                    <br>
                    <b>{{ placeSuggestion.suggestion }}</b>
                  </span>
              </QCardSection>
              <QCardActions align="right">
                <QBtn v-close-popup flat color="primary" label="Nein" />
                <QBtn v-close-popup flat color="primary" label="Ja" @click="acceptSuggestedPlaceName" />
              </QCardActions>
            </QCard>
          </QPopupProxy>
        </div>
      </div>
    </div>
  </div>
  <SidebarBottomNavigation
    @close="close"
    @forward="close"
    @back="back"
    :last="true"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { LocationDto } from 'src/api/model/LocationDto'
import { GeocodeResult } from 'src/types/GeocodeResult'
import StandaloneGeocoder from 'src/components/StandaloneGeocoder.vue'
import { geocodingService } from 'src/utils/mapbox'
import DraggableMarker from 'src/components/DraggableMarker.vue'
import {
  QBtn,
  QCard,
  QCardActions,
  QCardSection,
  QColor,
  QInput,
  QPopupEdit,
  QPopupProxy, QSpinnerPuff,
  QTable,
  QTd, QTh,
  QTr
} from 'quasar'
import { ionPencil, ionShareSocial, ionTrash } from '@quasar/extras/ionicons-v5'
import EditEventGeometryMixin from 'pages/edit-event/geometry/EditEventGeometryMixin'
import SidebarBottomNavigation from 'components/SidebarBottomNavigation.vue'
import EditEventAutoSaveMixin from 'pages/edit-event/EditEventAutoSaveMixin'
import { EditEventBus, START_DRAW_AREA } from 'src/store/EditEventStore'

export default defineComponent({
  name: 'EditEventGeometry',
  components: {
    DraggableMarker,
    StandaloneGeocoder,
    SidebarBottomNavigation,
    QPopupEdit,
    QColor,
    QSpinnerPuff,
    QPopupProxy,
    QBtn,
    QCard,
    QCardActions,
    QCardSection,
    QInput,
    QTable,
    QTd,
    QTr,
    QTh
  },
  mixins: [EditEventGeometryMixin, EditEventAutoSaveMixin],
  data() {
    return {
      loading: false,
      touched: false,
      columns: [{
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
      }, {
        name: 'details',
        label: 'Adressen',
        field: 'area_details'
      }, {
        name: 'actions',
        label: '',
        field: null,
        required: true
      }],
      ionShareSocial,
      ionTrash,
      ionPencil
    }
  },
  created() {
    if (this.event.location_description) {
      this.touched = true
    }
  },
  watch: {
    placeSuggestion: {
      async handler(newValue) {
        if (!newValue) return
        this.event.location = newValue.location
        if (!newValue?.suggestion) {
          newValue.suggestion = await this.getSuggestion(newValue?.location)
        }
        this.suggestPlaceName()
      },
      deep: true
    }
  },
  methods: {
    startDrawArea() {
      EditEventBus.emit(START_DRAW_AREA)
    },
    handleResult(geocoderResult: GeocodeResult) {
      const [lng, lat] = geocoderResult.center
      this.placeSuggestion = {
        suggestion: geocoderResult.place_name,
        location: {lat, lng}
      }
    },
    handleDropped(value: any) {
      this.event.location = value.coordinates
      this.placeSuggestion = { location: value.coordinates }
    },
    async getSuggestion(location: LocationDto) {
      return (await geocodingService.reverseGeocode({
        query: [location.lng, location.lat],
        mode: 'mapbox.places',
        language: ['de']
      }).send()).body.features[0]?.place_name
    },
    suggestPlaceName() {
      if (this.touched) {
        //@ts-ignore
        this.$refs.qPopupProxy.show()
      } else {
        this.acceptSuggestedPlaceName()
      }
    },
    acceptSuggestedPlaceName() {
      this.event.location_description = this.placeSuggestion?.suggestion ?? ''
    },
    async back() {
      await this.saveDebouncer.waitForSettle()
      this.$router.go(-1)
    },
    async close() {
      await this.saveDebouncer.waitForSettle()
      await this.$router.push({
        name: 'event-detail',
        params: {
          id: this.event.id.toString()
        }
      })
    }

  }
})
</script>

<style lang="scss" scoped>
@import "src/css/quasar.variables";

.edit-event-geometry {
  flex: 1;
}

.location-description {
  width: 100%
}

.headline {
  margin: 0.5rem 0;
  font-size: 1.5rem;
  line-height: 2rem;
  font-weight: bold;
}

.marker-column {
  display: flex;
  padding: 0 0.5rem 0.5rem 0.5rem;
  align-items: flex-end;
}

.edit-event-geometry {
  padding: 0.5rem;
}

.location-select {
  display: flex;
  flex-direction: column;
  margin: 1rem;
}

.table-header {
  background: $grey-3;
}
</style>
