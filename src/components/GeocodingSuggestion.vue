<template>
  <span class="place-caption-first-line">{{ firstLine }}</span>
  <span class="place-caption-second-line">{{ secondLine }}</span>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { GeocodeResult } from '@/types/GeocodeResult'

export default defineComponent({
  name: 'GeocodingSuggestion',
  props: {
    result: {
      type: Object as PropType<GeocodeResult>,
      required: true
    }
  },
  computed: {
    firstLine(): string {
      return this.result.place_name.split(',')[0]
    },
    secondLine(): string {
      return this.result.place_name.split(',').slice(1).join(', ')
    }
  }
})
</script>
<style lang="scss">
.place-caption-first-line {
  font-weight: bold;
  display: block;
}

.place-caption-second-line {
  display: block;
}
</style>
