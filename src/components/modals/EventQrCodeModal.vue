<script setup lang="ts">
import { ref } from 'vue'
import { QCard, QCardSection, QDialog } from 'quasar'
import QrCodeDownloadable from '../QrCodeDownloadable.vue'

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
    <QCard class="participants-modal">
      <QCardSection>
        <QrCodeDownloadable :url="props.url" :name="props.name" />
      </QCardSection>
    </QCard>
  </QDialog>
</template>

<style lang="scss" scoped>
.participants-modal {
  min-width: 320px;
}
</style>
