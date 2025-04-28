<script setup lang="ts">
import { computed } from 'vue'
import FilterInput from 'components/filterInput/FilterInput.vue'
import { PosterStatus, usePosterOptions } from 'src/api/model/PosterDto'
import { useI18n } from 'vue-i18n'

const ALL_STATES = 'all_states'

interface Props {
  modelValue?: PosterStatus | typeof ALL_STATES
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ALL_STATES
})

interface Emits {
  (e: 'update:modelValue', modelValue: string | undefined): void
}
const emit = defineEmits<Emits>()
const { t } = useI18n()
const { posterStatusOptions } = usePosterOptions()

const extendedOptions = computed(() => {
  return [
    {
      key: ALL_STATES,
      label: t('posterStatusFilter.showAllStates')
    },
    ...posterStatusOptions
  ]
})

function updateModelValue(value: string) {
  emit('update:modelValue', value !== ALL_STATES ? value : undefined)
}
</script>
<template>
  <FilterInput
    :label="$t('posterStatusFilter.defaultLabel')"
    :model-value="props.modelValue"
    @update:model-value="updateModelValue"
    :options="extendedOptions"
    emit-value
    map-options
    option-value="key"
    option-label="label"
  />
</template>
