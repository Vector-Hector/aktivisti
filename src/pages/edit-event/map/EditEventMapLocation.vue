<template>
  <MapOverlay
    position="top-left"
    class="location-overlay"
  >
    <h2 class="headline">
      Treffpunkt auswählen
    </h2>
    <p>Ziehe entweder das Markersymbol auf die Karte oder suche nach einem Ort über das Textfeld</p>
    <div class="row">
      <div class="col">
        <StandaloneGeocoder
          :access-token="accessToken"
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
          @dropped="markerDropped"
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
          outlined
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
                    <b>{{ suggestedPlaceName }}</b>
                  </span>
            </QCardSection>
            <QCardActions align="right">
              <QBtn v-close-popup flat color="primary" label="Nein" />
              <QBtn v-close-popup flat color="primary" label="Ja" @click="acceptSuggestedEvent" />
            </QCardActions>
          </QCard>
        </QPopupProxy>
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
    <QBtn
      class="gray-button"
      @click="$router.go(-1)"
    >
      Zurück
    </QBtn>
    <QBtn
      :disabled="!event.location || loading"
      class="submit-button"
      @click="saveAndClose"
      color="primary"
    >
      Speichern und zurück
    </QBtn>
    <QBtn
      :disabled="!event.location || loading"
      class="submit-button"
      color="primary"
      @click="saveAndProceed"
    >
      Gebiete zeichnen
    </QBtn>
  </MapOverlay>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Marker from 'src/mapbox/Marker.vue'
import { LocationDto } from 'src/api/model/LocationDto'
import { GeocodeResult } from 'src/types/GeocodeResult'
import MapOverlay from 'src/components/MapOverlay.vue'
import EditEventMixin from 'src/pages/edit-event/EditEventMixin'
import { EventDto } from 'src/api/model/EventDto'
import StandaloneGeocoder from 'src/components/StandaloneGeocoder.vue'
import { geocodingService } from 'src/utils/mapbox'
import DraggableMarker from 'src/components/DraggableMarker.vue'
import { QBtn, QCard, QCardActions, QCardSection, QInput, QPopupProxy } from 'quasar'


export default defineComponent({
  name: 'EditEventMapLocation',
  components: {
    DraggableMarker,
    StandaloneGeocoder,
    MapOverlay,
    Marker,
    QPopupProxy,
    QBtn,
    QCard,
    QCardActions,
    QCardSection,
    QInput
  },
  mixins: [EditEventMixin],
  data() {
    return {
      loading: false,
      accessToken: process.env.APP_MAPBOX_TOKEN,
      touched: !!this.event.location_description,
      suggestedPlaceName: ''
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
        mode: 'mapbox.places',
        language: ['de']
      }).send()).body.features[0]?.place_name

      if (this.touched) {
        this.suggestPlaceName(placeName)
      } else {
        this.event.location_description = placeName
      }
    },
    suggestPlaceName(placeName: string) {
      this.suggestedPlaceName = placeName
      // @ts-ignore
      this.$refs.qPopupProxy.show()
    },
    acceptSuggestedEvent() {
      this.event.location_description = this.suggestedPlaceName
    },
    async save() {
      this.loading = true
      try {
        this.localEvent = (await this.$apiClient.events.update(this.localEvent.id!.toString(), this.localEvent as EventDto)).payload.data
      } catch (e) {
        if (e.response.status === 400 && e.response.data['location']) {
          this.$q.notify(
            {
              color: 'warning',
              message: e.response.data['location'][0],
              timeout: 5000
            }
          )
        } else {
          this.$q.notify({
            color: 'negative',
            message: 'Ein unerwarteter Fehler ist aufgetreten',
            timeout: 2000
          })
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

.location-description {
  width: 100%
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
  display: flex;
  padding: 0 0.5rem 0.5rem 0.5rem;
  align-items: flex-end;
}

.location-overlay {
  max-width: 30rem;
}

</style>
