<script setup lang="ts">
import { computed } from 'vue'
import FilterInput from 'components/filterInput/FilterInput.vue'
import { useI18n } from 'vue-i18n'

enum Ownership {
  ME,
  OTHER,
  ALL
}

const { t } = useI18n()

const ownershipOptions: { key: Ownership; label: string }[] = [
  {
    label: t('ownershipFilter.options.me'),
    key: Ownership.ME
  },
  {
    label: t('ownershipFilter.options.other'),
    key: Ownership.OTHER
  },
  {
    label: t('ownershipFilter.options.all'),
    key: Ownership.ALL
  }
]

interface Props {
  modelValue?: boolean
}
const props = defineProps<Props>()

interface Emits {
  (e: 'update:modelValue', ownership: boolean | undefined): void
}
const emit = defineEmits<Emits>()

const selectedOwnership = computed(() => {
  if (props.modelValue) {
    return Ownership.ME
  } else if (props.modelValue === false) {
    return Ownership.OTHER
  } else {
    return Ownership.ALL
  }
})

function updateModelValue(value: Ownership) {
  if (value === Ownership.ME) {
    emit('update:modelValue', true)
  } else if (value === Ownership.OTHER) {
    emit('update:modelValue', false)
  } else {
    emit('update:modelValue', undefined)
  }
}
</script>
<template>
  <FilterInput
    :label="$t('ownershipFilter.defaultLabel')"
    :model-value="selectedOwnership"
    emit-value
    @update:model-value="updateModelValue"
    :options="ownershipOptions"
    map-options
    option-value="key"
    option-label="label"
  />
</template>
