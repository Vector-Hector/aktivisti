<script setup lang="ts">
import { ref } from 'vue'
import { QCard, QCardSection, QDialog } from 'quasar'
import QrCode from '../QrCode.vue'

interface Emits {
  // REQUIRED
  (e: 'ok'): void
  (e: 'hide'): void
}
const emit = defineEmits<Emits>()

interface Props {
  url: string
  name: string
}
const props = defineProps<Props>()

const dialog = ref<InstanceType<typeof QDialog> | null>(null)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function show() {
  dialog.value?.show()
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function hide() {
  dialog.value?.hide()
}
function onDialogHide() {
  emit('hide')
}
</script>

<template>
  <QDialog ref="dialog" @hide="onDialogHide">
    <QCard class="qr-code-modal">
      <QCardSection>
        <QrCode :url="props.url" :name="props.name" />
        <span>
          {{ props.url }}
        </span>
      </QCardSection>
    </QCard>
  </QDialog>
</template>

<style lang="scss" scoped>
.qr-code-modal {
  min-width: 320px;
}
</style>
