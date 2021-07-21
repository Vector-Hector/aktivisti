<template>

  <LocationSelect
    :location="poster.location"
    @update:location="updatePoster({location: $event})"
    :location-description="poster.location_description"
    @update:location-description="updatePoster({location_description: $event})"
    :error="errors.location?.[0]"
  />
  <QSelect
    filled
    :options="posterStatusOptions"
    :model-value="poster.status"
    @update:model-value="updatePoster({ status: $event })"
    map-options
    emit-value
    option-label="label"
    option-value="key"
    :error-message="errors.status?.[0]"
    :error="!!errors.status?.length"
  />
  <QSelect
    filled
    :options="posterMountOptions"
    :model-value="poster.mounted_on"
    @update:model-value="updatePoster({ mounted_on: $event })"
    map-options
    emit-value
    option-label="label"
    option-value="key"
    :error-message="errors.mounted_on?.[0]"
    :error="!!errors.mounted_on?.length"
  />
</template>
<script lang="ts">

import { defineComponent, PropType } from 'vue'
import { PosterDto, posterMountOptions, posterStatusOptions } from 'src/api/model/PosterDto'
import { QSelect } from 'quasar'
import { GeocodeResult } from 'src/types/GeocodeResult'
import { cloneDeep } from 'lodash-es'
import LocationSelect from 'components/LocationSelect.vue'

export default defineComponent({
  name: 'EditPoster',
  components: {
    LocationSelect,
    QSelect
  },
  props: {
    poster: {
      type: Object as PropType<Partial<PosterDto>>,
      required: true
    },
    new: {
      type: Boolean as PropType<boolean>,
      default: true
    },
    errors: {
      type: Object as PropType<Record<string, string[]>>,
      default: () => {
        return {}
      }
    }
  },
  emits: ['update:poster'],
  data() {
    return {
      currentResult: null as Partial<GeocodeResult> | null,
      geocodeResult: null as GeocodeResult | null,
      posterStatusOptions,
      posterMountOptions,
      localPoster: {} as Partial<PosterDto>,
      lastOriginalGeocodedResult: null as null | GeocodeResult
    }
  },
  created() {
    this.localPoster = cloneDeep(this.poster)
  },
  watch: {
    'poster.location': {
      handler(newValue) {
        if (newValue !== this.localPoster.location) {
          this.localPoster.location = cloneDeep(newValue)
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    updatePoster(poster: Partial<PosterDto>) {
      this.localPoster = {...this.localPoster, ...poster}
      this.$emit('update:poster', this.localPoster)
    }
  }
})
</script>
