<script setup lang="ts">
import { ref } from 'vue'
import QrCode from './QrCode.vue'
import { QBtn } from 'quasar'

interface Props {
  url: string
  name: string
}

const props = defineProps<Props>()
const qrRef = ref<InstanceType<typeof QrCode> | null>(null)
function downloadQrCode(): void {
  qrRef.value.downloadQrCode()
}
</script>
<template>
  <div class="qr-code-container">
    <QrCode ref="qrRef" :name="props.name" :url="props.url"></QrCode>
    <QBtn class="full-width" color="primary" @click="downloadQrCode()"
      >Download</QBtn
    >
  </div>
</template>

<style scoped>
.qr-code-container {
  background: transparent;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 1rem;
  padding: auto;
  .q-btn {
    margin-top: 1rem;
  }
}
</style>
