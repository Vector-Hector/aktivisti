<script setup lang="ts">
import { getCurrentInstance, nextTick, ref, watch } from 'vue'
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

const suggestionPopup = ref<InstanceType<typeof QPopupProxy> | null>(null)
const currentGeocodeResult = ref<Partial<GeocodeResult>>({ place_name: '' })
const suggestion = ref<string>('')
const touched = ref<boolean>(false)
const lastOriginalPlaceName = ref<null | string>(null)

touched.value = !!props.locationDescription

watch(
  () => props.locationDescription,
  (newValue) => {
    currentGeocodeResult.value = {
      ...currentGeocodeResult.value,
      place_name: newValue
    }
  },
  { immediate: true }
)

watch(
  () => props.location,
  async (newValue) => {
    // By checking if the new location is equal to the last geocoded
    // location we can determine if the location change comes from outside
    const sameLocation =
      newValue?.lng === currentGeocodeResult.value?.center?.[0] &&
      newValue?.lat === currentGeocodeResult.value?.center?.[1]
    if (!sameLocation) {
      handleLocationChange(await reverseLocation(newValue))
    }
  }
)

const setLastOriginalPlaceName = (placeName: string) => {
  lastOriginalPlaceName.value = placeName
}

const setGeocodeResult = (geocoderResult: Partial<GeocodeResult>) => {
  currentGeocodeResult.value = geocoderResult
  const instance = getCurrentInstance()
  void nextTick(() => instance?.proxy?.$forceUpdate)
}

const handleLocationSelect = (geocoderResult: GeocodeResult) => {
  setLastOriginalPlaceName(geocoderResult.place_name)
  setGeocodeResult(geocoderResult)
  emit('update:location', {
    lng: geocoderResult.center[0],
    lat: geocoderResult.center[1]
  })
  emit('update:locationDescription', geocoderResult.place_name)
}

const handleLocationChange = (geocoderResult: GeocodeResult) => {
  setLastOriginalPlaceName(geocoderResult.place_name)
  // when retrieving reversed result preserve the location until the user confirms it
  setGeocodeResult({
    ...geocoderResult,
    place_name:
      currentGeocodeResult.value?.place_name ?? props.locationDescription
  })
  suggestion.value = geocoderResult?.place_name ?? ''
  suggestPlace()
}

const handleTextInput = (geocoderResult: Partial<GeocodeResult>) => {
  touched.value = geocoderResult?.place_name !== lastOriginalPlaceName.value
  if (props.locationDescription !== geocoderResult.place_name) {
    // if the result id doesn't change the geocoder widget had some custom input we immediately propagate
    emit('update:locationDescription', geocoderResult.place_name)
  }
}

const handleDropped = (value: any) => {
  emit('update:location', value.coordinates)
}

const suggestPlace = () => {
  if (touched.value && suggestion.value !== props.locationDescription) {
    suggestionPopup.value?.show()
  } else {
    acceptSuggestedPlace()
  }
}

const acceptSuggestedPlace = () => {
  emit('update:locationDescription', suggestion.value)
}

const reverseLocation = async (location: LocationDto) => {
  return await reverseGeocode({
    lng: location.lng,
    lat: location.lat,
    language: ['de']
  })
}
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
