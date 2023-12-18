<script setup lang="ts">
import { defineComponent, nextTick } from 'vue'
import StandaloneGeocoder from 'components/StandaloneGeocoder.vue'
import { QBtn, QCard, QCardActions, QCardSection, QPopupProxy } from 'quasar'
import { GeocodeResult } from 'src/types/GeocodeResult'
import DraggableMarker from 'components/DraggableMarker.vue'
import { LocationDto } from 'src/api/model/LocationDto'
import { reverseGeocode } from 'src/utils/map'

interface Props {
  location?: LocationDto
  locationDescription?: string
  error?: string
  isDraggableMarkerShown: boolean
}

interface Emits {
  (e: 'update:location', LocationDto): void
  (e: 'update:locationDescription', string): void
}

const props = withDefaults(defineProps<Props>(), {
  error: () => '',
  isDraggableMarkerShown: () => true
})

const emit = defineEmits<Emits>()

export default defineComponent({
  name: 'LocationSelect',
  components: {
    DraggableMarker,
    StandaloneGeocoder,
    QPopupProxy,
    QBtn,
    QCard,
    QCardActions,
    QCardSection
  },
  data() {
    return {
      currentGeocodeResult: { place_name: '' } as Partial<GeocodeResult>,
      suggestion: '',
      touched: false,
      lastOriginalPlaceName: null as null | string
    }
  },
  created() {
    this.touched = !!this.locationDescription
  },
  watch: {
    locationDescription: {
      handler(newValue) {
        this.currentGeocodeResult = {
          ...this.currentGeocodeResult,
          place_name: newValue
        }
      },
      immediate: true
    },
    async location(newValue) {
      // By checking if the new location is equal to the last geocoded
      // location we can determine if the location change comes from outside
      const sameLocation =
        newValue?.lng === this.currentGeocodeResult?.center?.[0] &&
        newValue?.lat === this.currentGeocodeResult?.center?.[1]
      if (!sameLocation) {
        this.handleLocationChange(await this.reverseLocation(newValue))
      }
    }
  },
  methods: {
    setLastOriginalPlaceName(placeName: string) {
      this.lastOriginalPlaceName = placeName
    },
    setGeocodeResult(geocoderResult: Partial<GeocodeResult>) {
      this.currentGeocodeResult = geocoderResult
      void nextTick(() => this.$forceUpdate())
    },
    handleLocationSelect(geocoderResult: GeocodeResult) {
      this.setLastOriginalPlaceName(geocoderResult.place_name)
      this.setGeocodeResult(geocoderResult)
      this.$emit('update:location', {
        lng: geocoderResult.center[0],
        lat: geocoderResult.center[1]
      })
      this.$emit('update:locationDescription', geocoderResult.place_name)
    },
    handleLocationChange(geocoderResult: GeocodeResult) {
      this.setLastOriginalPlaceName(geocoderResult.place_name)
      // when retrieving reversed result preserve the location until the user confirms it
      this.setGeocodeResult({
        ...geocoderResult,
        place_name:
          this.currentGeocodeResult?.place_name ?? this.locationDescription
      })
      this.suggestion = geocoderResult?.place_name ?? ''
      this.suggestPlace()
    },
    handleTextInput(geocoderResult: Partial<GeocodeResult>) {
      this.touched = geocoderResult?.place_name !== this.lastOriginalPlaceName
      if (this.locationDescription !== geocoderResult.place_name) {
        // if the result id doesn't change the geocoder widget had some custom input we immediately propagate
        this.$emit('update:locationDescription', geocoderResult.place_name)
      }
    },
    handleDropped(value: any) {
      this.$emit('update:location', value.coordinates)
    },
    suggestPlace() {
      if (this.touched && this.suggestion !== this.locationDescription) {
        //@ts-ignore
        this.$refs.suggestionPopup?.show()
      } else {
        this.acceptSuggestedPlace()
      }
    },
    acceptSuggestedPlace() {
      this.$emit('update:locationDescription', this.suggestion)
    },
    async reverseLocation(location: LocationDto) {
      return await reverseGeocode({
        lng: location.lng,
        lat: location.lat,
        language: ['de']
      })
    }
  }
})
</script>

<template>
  <div class="row">
    <div class="col-12">
      <span class="description-text">
        <slot name="hintText">
          Bitte gib entweder eine Adresse in das Suchfeld ein oder verschiebe
          den rot hervorgehobenen Pin auf der Karte, um die Position dieses
          Standorts auf der Karte festzulegen.
        </slot>
      </span>
    </div>
  </div>
  <div class="row">
    <div class="col-grow">
      <StandaloneGeocoder
        :result="currentGeocodeResult"
        @update:result="handleTextInput"
        @new-result="handleLocationSelect"
        :custom-place-name="true"
        :error="error"
      />
      <QPopupProxy no-parent-event ref="suggestionPopup">
        <QCard>
          <QCardSection>
            <span>
              Willst du die Beschreibung für diesen Ort übernehmen?
              <br />
              <b>{{ suggestion }}</b>
            </span>
          </QCardSection>
          <QCardActions align="right">
            <QBtn v-close-popup flat color="primary" label="Nein" />
            <QBtn
              v-close-popup
              flat
              color="primary"
              label="Ja"
              @click="acceptSuggestedPlace"
            />
          </QCardActions>
        </QCard>
      </QPopupProxy>
    </div>
    <div v-if="isDraggableMarkerShown" class="col-shrink marker-column">
      <DraggableMarker
        v-if="!location"
        class="draggable-marker"
        @dropped="handleDropped"
      />
    </div>
  </div>
</template>

<style lang="scss">
.marker-column {
  display: flex;
  padding: 0.25rem 0.5rem;
  align-items: flex-start;
}

.draggable-marker {
  width: 2rem;
  height: 2rem;
  cursor: grab;
}

.description-text {
  color: $grey-6;
  font-size: 0.75rem;
  padding: 1rem 2rem 1rem 0;
  line-height: 1;
  display: block;
}
</style>
