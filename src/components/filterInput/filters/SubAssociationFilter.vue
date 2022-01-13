<template>
  <FilterInput
    label="Bezirks/Kreisverband"
    multiple
    :model-value="modelValue"
    @update:model-value="(value)=>this.$emit('update:modelValue', value)"
    use-input
    use-chips
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
<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { SubAssociationDto } from 'src/api/model/SubAssociationDto'
import FilterInput from 'components/filterInput/FilterInput.vue'

export default defineComponent({
    name: 'SubAssociationFilter',
    components: {
      FilterInput
    },
    props: {
      options: {
        type: Array as PropType<SubAssociationDto[]>,
        required: true
      },
      modelValue: {
        type: Array as PropType<number[]>
      }
    },
    created() {
      this.suggestedOptions = this.options
    },
    data() {
      return {
        suggestedOptions: [] as SubAssociationDto[]
      }
    },
    emits: ['update:modelValue'],
    methods: {
      filterOptions(value: string, update: any) {
        if (!value) {
          update(() => {
            this.suggestedOptions = this.options
          })
          return
        }
        update(() => {
          const lowercasedValue = value.toLowerCase()
          this.suggestedOptions = this.options.filter(({name}) => name.toLowerCase().includes(lowercasedValue))
        })
      }
    },
    watch: {
      options() {
        this.suggestedOptions = this.options
      }
    }
  }
)
</script>
