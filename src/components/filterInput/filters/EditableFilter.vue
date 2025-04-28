<script setup lang="ts">
import { QField, QToggle } from 'quasar'

interface Props {
  modelValue?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

function updateModelValue(value: boolean) {
  emit('update:modelValue', value)
}
</script>
<template>
  <QField filled dense>
    <template v-slot:control>
      <QToggle
        :label="$t('editableFilter.defaultLabel')"
        class="flex justify-between full-width"
        left-label
        color="primary"
        :model-value="props.modelValue"
        emit-value
        @update:model-value="updateModelValue"
      />
    </template>
  </QField>
</template>
