<script setup lang="ts">
import { ref } from 'vue'
import FilterInput from 'components/filterInput/FilterInput.vue'
import { SortOption } from 'src/stores/user'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const SortOptionLabels = {
  [SortOption.START_DATE_DESC]: t('sortOrderFilter.options.startDateDesc'),
  [SortOption.START_DATE_ASC]: t('sortOrderFilter.options.startDateAsc'),
  [SortOption.NAME]: t('sortOrderFilter.options.name')
}
interface Props {
  modelValue?: string
}
const props = defineProps<Props>()

interface Emits {
  (e: 'update:modelValue', string): void
}
const emit = defineEmits<Emits>()

const sortOptions = ref(Object.values(SortOption))
</script>

<template>
  <FilterInput
    class="filter-dropdown"
    :model-value="props.modelValue"
    @update:model-value="(value) => emit('update:modelValue', value)"
    input-debounce="0"
    :label="$t('sortOrderFilter.defaultLabel')"
    :options="sortOptions"
    :option-label="(item) => SortOptionLabels[item]"
    placeholder="$t('sortOrderFilter.placeholder')"
  />
</template>
