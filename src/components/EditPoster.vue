<script setup lang="ts">
import { ref, watch } from 'vue'
import { PosterDto } from 'src/api/model/PosterDto'
import { QInput, QSelect } from 'quasar'
import { cloneDeep } from 'lodash-es'
import LocationSelect from 'components/LocationSelect.vue'
import { usePosterOptions } from 'src/api/model/PosterDto'

interface Props {
  poster: Partial<PosterDto>
  new?: boolean
  errors?: Record<string, string[]>
  editLocation?: boolean
}

interface Emits {
  (e: 'update:poster', poster: Partial<PosterDto>): void
}

const props = withDefaults(defineProps<Props>(), {
  new: true,
  errors: () => {
    return {}
  },
  editLocation: false
})
const emit = defineEmits<Emits>()

const { posterStatusOptions, posterMountOptions } = usePosterOptions()

const localPoster = ref<Partial<PosterDto>>({})

localPoster.value = cloneDeep(props.poster)

watch(
  () => props.poster.location,
  (newValue) => {
    if (newValue !== localPoster.value.location) {
      localPoster.value.location = cloneDeep(newValue)
    }
  },
  { deep: true, immediate: true }
)

function updatePoster(poster: Partial<PosterDto>) {
  localPoster.value = { ...localPoster.value, ...poster }
  emit('update:poster', localPoster.value)
}
</script>

<template>
  <LocationSelect
    v-if="editLocation"
    :location="poster.location"
    @update:location="updatePoster({ location: $event })"
    :location-description="poster.location_description"
    @update:location-description="
      updatePoster({ location_description: $event })
    "
    :error="errors.location?.[0]"
  />
  <QInput
    v-else
    :model-value="poster.location_description"
    readonly
    disable
    filled
    :label="$t('editPoster.address')"
    :error-message="errors.location_description?.[0]"
    :error="!!errors.location_description?.length"
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
    :label="$t('editPoster.status')"
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
    :label="$t('editPoster.mountedOn')"
    :error-message="errors.mounted_on?.[0]"
    :error="!!errors.mounted_on?.length"
  />
</template>
