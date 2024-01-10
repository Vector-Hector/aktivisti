<script setup lang="ts">
import { ref, watch } from 'vue'
import { SubAssociationDto } from 'src/api/model/SubAssociationDto'
import FilterInput from 'components/filterInput/FilterInput.vue'

interface Props {
  options: SubAssociationDto[]
  modelValue?: number[]
  multiple?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: number[] | undefined): void
}

const props = withDefaults(defineProps<Props>(), {
  multiple: true
})
const emit = defineEmits<Emits>()

const suggestedOptions = ref<SubAssociationDto[]>([])
suggestedOptions.value = props.options

function filterOptions(value: string, update: any) {
  if (!value) {
    update(() => {
      suggestedOptions.value = props.options
    })
    return
  }
  update(() => {
    const lowercasedValue = value.toLowerCase()
    suggestedOptions.value = props.options.filter(({ name }) =>
      name.toLowerCase().includes(lowercasedValue)
    )
  })
}

watch(
  () => props.options,
  () => {
    suggestedOptions.value = props.options
  }
)
</script>

<template>
  <FilterInput
    label="Bezirks/Kreisverband"
    :multiple="multiple"
    :model-value="modelValue"
    @update:model-value="(value) => emit('update:modelValue', value)"
    use-input
    :use-chips="multiple"
    emit-value
    map-options
    clearable
    input-debounce="0"
    :options="suggestedOptions"
    @filter="filterOptions"
    option-value="id"
    option-label="name"
  >
    <template v-slot:no-option>
      <q-item>
        <q-item-section class="text-grey">
          Kein Verband gefunden
        </q-item-section>
      </q-item>
    </template>
  </FilterInput>
</template>
