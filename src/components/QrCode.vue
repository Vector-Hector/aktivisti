<script setup lang="ts">
import { ref, onMounted } from 'vue'
import QRCodeStyling from 'qr-code-styling'

export type QrCodeImage = 'flag' | 'pin' | 'normal'

interface Props {
  url: string
  name: string
  image: QrCodeImage
}

const props = defineProps<Props>()

const qrContainer = ref<HTMLElement | null>(null)
let qr: QRCodeStyling
let imageUrl = ''
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

  switch (props.image) {
    case 'flag':
      imageUrl = '/icons/favicon-96x96.png'
      break
    case 'normal':
      imageUrl = '/icons/icon-128x128.png'
      break
    case 'pin':
      imageUrl = '/static/icons/map-pin-generic.png'
      break
    default:
      imageUrl = '/icons/favicon-96x96.png'
      break
  }

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
    image: imageUrl,
    imageOptions: {
      margin: 4,
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
