<script setup lang="ts">
import { ref } from 'vue'
import FilterInput from 'components/filterInput/FilterInput.vue'
import { SortOption } from 'src/store/UserStore'

const SortOptionLabels = {
  [SortOption.START_DATE]: 'Datum (Beginn)',
  [SortOption.NAME]: 'Aktionsname'
}
interface Props {
  modelValue?: string
}
const props = defineProps<Props>()

const sortOptions = ref(Object.values(SortOption))

interface Emits {
  (e: 'update:modelValue', string): void
}
const emit = defineEmits<Emits>()
</script>

<template>
  <FilterInput
    class="filter-dropdown"
    :model-value="props.modelValue"
    @update:model-value="(value) => emit('update:modelValue', value)"
    input-debounce="0"
    label="Sortierung"
    :options="sortOptions"
    :option-label="(item) => SortOptionLabels[item]"
    placeholder="Sortierung auswählen"
  />
</template>
