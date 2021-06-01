<template>
  <ConfirmationPopupWithComponent />
  <MapOverlay
    position="top-left"
    class="location-overlay"
  >
    <h2 class="headline">
      Treffpunkt auswählen
    </h2>
    <p>Ziehe entweder das Markersymbol auf die Karte oder suche nach einem Ort über das Textfeld</p>
    <div class="p-grid">
      <div class="p-col">
        <StandaloneGeocoder
          :access-token="accessToken"
          :standalone="true"
          @result="handleResult($event.value)"
        />
      </div>
      <div
        v-if="event.location === null"
        class="p-col marker-column"
      >
        <DraggableMarker
          class="draggable-marker"
          @dropped="markerDropped"
        />
      </div>
      <div class="p-col-12">
        <div class="p-fluid">
          <div class="p-field">
            <label for="locationDescription">Beschreibung</label>
            <InputText
              id="locationDescription"
              ref="descriptionInput"
              v-model="event.location_description"
              type="text"
              @keydown="touched = true"
            />
          </div>
        </div>
      </div>
    </div>
  </MapOverlay>
  <Marker
    v-if="event.location"
    v-model:location="event.location"
    :draggable="true"
    @update:location="updateDescription"
  />
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
    <Button
      :disabled="!event.location || loading"
      class="submit-button"
      @click="saveAndClose"
    >
      Speichern und zurück
    </Button>
    <Button
      :disabled="!event.location || loading"
      class="submit-button"
      @click="saveAndProceed"
    >
      Gebiete zeichnen
    </Button>
  </MapOverlay>
</template>

<script lang="ts">
import { defineComponent, markRaw } from 'vue'
import Marker from 'src/mapbox/Marker.vue'
import { LocationDto } from 'src/api/model/LocationDto'
import { GeocodeResult } from 'src/types/GeocodeResult'
import MapOverlay from 'src/components/MapOverlay.vue'
import Button from 'primevue/button'
import EditEventMixin from 'src/pages/edit-event/EditEventMixin'
import { EventDto } from 'src/api/model/EventDto'
import InputText from 'primevue/inputtext'
import StandaloneGeocoder from 'src/components/StandaloneGeocoder.vue'
import { geocodingService } from 'src/utils/mapbox'
import ConfirmationPopupWithComponent from 'src/components/ConfirmationPopupWithComponent.vue'
import ConfirmPlaceName from 'src/components/confirmations/ConfirmPlaceName.vue'
import DraggableMarker from 'src/components/DraggableMarker.vue'


export default defineComponent({
  name: 'EditEventMapLocation',
  components: {
    DraggableMarker,
    ConfirmationPopupWithComponent,
    StandaloneGeocoder,
    MapOverlay,
    Marker,
    Button,
    InputText
  },
  mixins: [EditEventMixin],
  data() {
    return {
      loading: false,
      accessToken: process.env.APP_MAPBOX_TOKEN,
      touched: !!this.event.location_description
    }
  },
  methods: {
    handleResult(geocoderResult: GeocodeResult) {
      if (this.touched) {
        this.suggestPlaceName(geocoderResult.place_name)
      } else {
        this.event.location_description = geocoderResult.place_name
      }
      this.event.location = {
        lat: geocoderResult.center[1],
        lng: geocoderResult.center[0]
      }
    },
    async updateDescription(location: LocationDto) {
      const placeName = (await geocodingService.reverseGeocode({
        query: [location.lng, location.lat],
        mode: 'mapbox.places'
      }).send()).body.features[0]?.place_name

      if (this.touched) {
        this.suggestPlaceName(placeName)
      } else {
        this.event.location_description = placeName
      }
    },
    suggestPlaceName(placeName: string) {
      this.$confirm.require({
        icon: 'pi pi-info-circle',
        message: `Bezeichnung dieses Ortes übernehmen?\n${placeName}`,
        component: markRaw(ConfirmPlaceName),
        componentProps: {
          placeName
        },
        target: (this.$refs.descriptionInput as any).$el,
        accept: () => {
          this.event.location_description = placeName
        }
      })
    },
    async save() {
      this.loading = true
      try {
        this.localEvent = (await this.$apiClient.events.update(this.localEvent.id!.toString(), this.localEvent as EventDto)).payload.data
      } catch (e) {
        if (e.status === 400 && e.data['location']) {
          this.$toast.add(
            {severity: 'warn', summary: 'Ungültiger Ort', detail: e.data['location'][0], life: 3000, closable: true}
          )
        } else {
          this.$toast.add(
            {
              severity: 'error',
              summary: 'Fehler',
              detail: 'Ein unerwarteter Fehler ist aufgetreten',
              life: 3000,
              closable: true
            }
          )
        }
        return false
      } finally {
        this.loading = false
      }
      return true
    },
    async saveAndProceed() {
      const success = await this.save()
      if (success) {
        await this.$router.push({name: 'edit-event-routes'})
      }
    },
    async saveAndClose() {
      const success = await this.save()
      if (success) {

        await this.$router.push({
          name: 'event-detail',
          params: {
            id: this.event.id!.toString()
          }
        })
      }
    },
    markerDropped(event: any) {
      this.event.location = event.coordinates
      void this.updateDescription(event.coordinates)
    }
  }
})
</script>

<style lang="scss" scoped>
@import "src/css/_map.scss";
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

.headline {
  margin: 0.5rem 0;
  font-size: 1.5rem;
  line-height: 2rem;
  font-weight: bold;
}

::v-deep(.p-confirm-popup-message) {
  white-space: pre-wrap;
}

.marker-column {
  flex: 0;
  align-self: center;
}

.location-overlay {
  max-width: 30rem;
}

</style>
