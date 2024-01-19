<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { forwardGeocode } from 'src/utils/map'
import { GeocodeResult } from 'src/types/GeocodeResult'
import { QItem, QItemSection, QItemLabel, QSelect, QIcon } from 'quasar'
import { ionSearch } from '@quasar/extras/ionicons-v5'
import { MAP_GEOLOCATE_STOP_TRACKING, MapEventBus } from 'src/map/Map.vue'

export default defineComponent({
  name: 'StandaloneGeocoder',
  props: {
    result: {
      type: Object as PropType<Partial<GeocodeResult>>,
      required: false
    },
    customPlaceName: {
      type: Boolean as PropType<boolean>,
      default: false
    },
    error: {
      type: String as PropType<string>,
      default: ''
    }
  },
  emit: ['update:description', 'update:result', 'newResult'],
  components: {
    QItem,
    QItemLabel,
    QItemSection,
    QSelect,
    QIcon
  },
  data() {
    return {
      selectedGeocode: null as GeocodeResult | null,
      filteredPlaces: [] as GeocodeResult[],
      ionSearch
    }
  },
  methods: {
    async filterFn(val: any, update: any, abort: any) {
      if (val.length < 2) {
        abort()
        return
      }
      await update(async () => {
        this.filteredPlaces = (
          await forwardGeocode({
            query: val,
            countries: ['de'],
            language: ['de']
          })
        ).features
      })
    },
    stopTracking() {
      MapEventBus.emit(MAP_GEOLOCATE_STOP_TRACKING)
    },
    updatePlaceName(value: string) {
      if (!this.customPlaceName) return
      this.$emit('update:result', {
        ...this.result,
        place_name: value
      })
    },
    emitResult(selection: GeocodeResult) {
      this.$emit('update:result', selection)
      this.$emit('newResult', selection)
    }
  }
})
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
