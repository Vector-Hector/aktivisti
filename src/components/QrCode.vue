<script setup lang="ts">
import { ref, onMounted } from 'vue'
import QRCodeStyling from 'qr-code-styling'

interface Props {
  url: string
  name: string
}

const props = defineProps<Props>()

const qrContainer = ref<HTMLElement | null>(null)
let qr: QRCodeStyling

onMounted(() => {
  qr = new QRCodeStyling({
    width: 256,
    height: 256,
    data: props.url,
    dotsOptions: { color: '#000', type: 'square' },
    cornersDotOptions: {
      color: '#DF0303',
      type: 'square'
    },
    backgroundOptions: { color: '#fff' },
    image: '/icons/favicon-96x96.png',
    imageOptions: {
      margin: 10,
      imageSize: 0.6
    },
    qrOptions: {
      errorCorrectionLevel: 'H'
    }
  })

  if (qrContainer.value) {
    qr.append(qrContainer.value)
  }
})

async function downloadQrCode(): Promise<void> {
  await qr.download({
    name: `${props.name.replaceAll(' ', '_')}_qr_code`,
    extension: 'png'
  })
}

defineExpose({ downloadQrCode })
</script>
<template>
  <div class="qr-code" ref="qrContainer"></div>
</template>

<style scoped>
.qr-code {
  text-align: center;
}
</style>
