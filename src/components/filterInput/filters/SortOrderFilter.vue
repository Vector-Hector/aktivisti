<template>
  <FilterInput
    class="filter-dropdown"
    :model-value="modelValue"
    @update:model-value="(value) => this.$emit('update:modelValue', value)"
    input-debounce="0"
    label="Sortierung"
    :options="sortOptions"
    :option-label="(item) => SortOptionLabels[item]"
    placeholder="Sortierung auswählen"
  />
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue'
import FilterInput from 'components/filterInput/FilterInput.vue'
import { SortOption } from 'src/store/UserStore'

const SortOptionLabels = {
  [SortOption.START_DATE]: 'Datum (Beginn)',
  [SortOption.NAME]: 'Aktionsname'
}

export default defineComponent({
  name: 'SortOrderFilter',
  components: {
    FilterInput
  },
  props: {
    modelValue: {
      type: String as PropType<string>
    }
  },
  data() {
    return {
      sortOptions: Object.values(SortOption),
      SortOptionLabels
    }
  },
  emits: ['update:modelValue']
})
</script>
