<template>
  <div class="counter-input">
    <div class="p-fluid">
      <div class="p-field">
        <label for="queryValue">Ort suchen</label>
        <AutoComplete
          id="queryValue"
          v-model="queryValue"
          class="query-field"
          :suggestions="filteredPlaces"
          @complete="filterPlaces($event)"
          @item-select="emitResult($event)"
        >
          <template #item="slotProps">
            <span class="place-caption-first-line">{{ slotProps.item.place_name.split(',')[0] }}</span>
            <span class="place-caption-second-line">{{ slotProps.item.place_name.split(',').slice(1).join(', ') }}</span>
          </template>
        </AutoComplete>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AutoComplete from 'primevue/autocomplete'
import { geocodingService } from '@/utils/mapbox'
import { GeocodeResult } from '@/types/GeocodeResult'


interface PlaceSuggestion {
  title: string
  subtitle: string
}

export default defineComponent({
  name: 'StandaloneGeocoder',
  components: {
    AutoComplete
  },
  emits: ['result'],
  data() {
    return {
      queryValue: '',
      filteredPlaces: [] as PlaceSuggestion[]
    }
  },
  methods: {
    async filterPlaces(event: any) {
      this.filteredPlaces = (await geocodingService.forwardGeocode({
        query: event.query as string,
        mode: 'mapbox.places',
        countries: ['DE']
      }).send()).body.features
    },

    emitResult(event: GeocodeResult) {
      this.$emit('result', event)
      this.queryValue = ''
    }
  }
})
</script>

<style lang="scss" scoped>

.place-caption-first-line {
  font-weight: bold;
  display: block;
}

.place-caption-second-line {
  display: block;
}

</style>
