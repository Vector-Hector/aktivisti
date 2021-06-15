<template>
  <div class="counter-input">
    <div class="p-fluid">
      <div class="p-field">
        <label for="queryValue">Ort suchen</label>
        <QSelect
          id="queryValue"
          :model-value="selectedGeocode"
          class="search-place"
          hide-selected
          hide-dropdown-icon
          @filter="filterFn"
          dense
          outlined
          :options="filteredPlaces"
          option-label="place_name"
          use-input
          @update:model-value="emitResult($event)"
        >
          <template v-slot:option="slotProps">
            <QItem
              v-bind="slotProps.itemProps"
            >
              <QItemSection>
               <QItemLabel>{{slotProps.opt.place_name.split(',')[0]}}</QItemLabel>
                <QItemLabel caption>{{slotProps.opt.place_name.split(',').slice(1).join(', ')}}</QItemLabel>
              </QItemSection>
            </QItem>
          </template>
          </QSelect>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { geocodingService } from 'src/utils/mapbox'
import { GeocodeResult } from 'src/types/GeocodeResult'
import { QItem, QItemSection, QItemLabel, QSelect } from 'quasar';

export default defineComponent({
  name: 'StandaloneGeocoder',
  components: {
    QItem,
    QItemLabel,
    QItemSection,
    QSelect
  },
  emits: ['result'],
  data() {
    return {
      selectedGeocode: null as GeocodeResult | null,
      filteredPlaces: [] as GeocodeResult[]
    }
  },
  methods: {
    async filterFn(val: any, update: any, abort: any){
      if (val.length < 2){
        abort()
        return
      }
      await update(async () => {
        this.filteredPlaces = (await geocodingService.forwardGeocode({
          query: val,
          mode: 'mapbox.places',
          countries: ['DE']
        }).send()).body.features
      })
    },
    emitResult(selection: GeocodeResult) {
      this.$emit('result', selection)
    }
  }
})
</script>

<style lang="scss" scoped>

.search-place {
  width:100%;
}

.place-caption-first-line {
  font-weight: bold;
  display: block;
}

.place-caption-second-line {
  display: block;
}

</style>
