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
  const primaryColor = getComputedStyle(qrContainer.value)
    .getPropertyValue('--primary-color')
    .trim()
  const dotColor = getComputedStyle(qrContainer.value)
    .getPropertyValue('--dot-color')
    .trim()
  const backgroundColor = getComputedStyle(qrContainer.value)
    .getPropertyValue('--background-color')
    .trim()
  qr = new QRCodeStyling({
    width: 256,
    height: 256,
    data: props.url,
    dotsOptions: { color: dotColor, type: 'square' },
    cornersDotOptions: {
      color: primaryColor,
      type: 'square'
    },
    backgroundOptions: { color: backgroundColor },
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

<style scoped lang="scss">
@import '/src/css/_variables.scss';

.qr-code {
  text-align: center;
  --primary-color: #{$primary};
  --background-color: #{$white};
  --dot-color: #{$text-primary};
}
</style>
