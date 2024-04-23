<script setup lang="ts">
import { ref } from 'vue'
import { forwardGeocode } from 'src/utils/map'
import { GeocodeResult } from 'src/types/GeocodeResult'
import { QItem, QItemSection, QItemLabel, QSelect, QIcon } from 'quasar'
import { ionSearch } from '@quasar/extras/ionicons-v5'
import { MAP_GEOLOCATE_STOP_TRACKING, MapEventBus } from 'src/map/MapUtils'

interface Props {
  result?: Partial<GeocodeResult>
  customPlaceName?: boolean
  error?: string
}
const props = withDefaults(defineProps<Props>(), {
  customPlaceName: false,
  error: ''
})

interface Emits {
  (e: 'update:result', result: Partial<GeocodeResult>): void
  (e: 'newResult', result: GeocodeResult): void
}
const emit = defineEmits<Emits>()

const filteredPlaces = ref<GeocodeResult[]>([])

async function filterFn(val: any, update: any, abort: any) {
  if (val.length < 2) {
    abort()
    return
  }
  await update(async () => {
    filteredPlaces.value = (
      await forwardGeocode({
        query: val,
        countries: ['de'],
        language: ['de']
      })
    ).features
  })
}
function stopTracking() {
  MapEventBus.emit(MAP_GEOLOCATE_STOP_TRACKING)
}
function updatePlaceName(value: string) {
  if (!props.customPlaceName) return
  emit('update:result', {
    ...props.result,
    place_name: value
  })
}
function emitResult(selection: GeocodeResult) {
  emit('update:result', selection)
  emit('newResult', selection)
}
</script>

<template>
  <div class="counter-input">
    <div class="p-fluid">
      <div class="p-field">
        <div @mousedown="stopTracking" @touchstart="stopTracking">
          <QSelect
            id="queryValue"
            :model-value="result"
            class="search-place"
            hide-dropdown-icon
            @filter="filterFn"
            dense
            filled
            label="Adresse eingeben"
            :fill-input="customPlaceName"
            use-input
            hide-selected
            @input-value="updatePlaceName"
            option-label="place_name"
            :options="filteredPlaces"
            :error-message="error"
            :error="!!error"
            @update:model-value="emitResult($event)"
          >
            <template v-slot:append>
              <QIcon :name="ionSearch" />
            </template>
            <template v-slot:option="slotProps">
              <QItem v-bind="slotProps.itemProps">
                <QItemSection>
                  <QItemLabel>{{
                    slotProps.opt.place_name.split(',')[0]
                  }}</QItemLabel>
                  <QItemLabel caption>{{
                    slotProps.opt.place_name.split(',').slice(1).join(', ')
                  }}</QItemLabel>
                </QItemSection>
              </QItem>
            </template>
          </QSelect>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.search-place {
  width: 100%;
}

.place-caption-first-line {
  font-weight: bold;
  display: block;
}

.place-caption-second-line {
  display: block;
}
</style>
