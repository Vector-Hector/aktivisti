<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import QRCodeStyling from 'qr-code-styling'

interface Props {
  url: string
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
      type: 'dot'
    },
    backgroundOptions: { color: '#fff' },
    image: '/icons/favicon-96x96.png',
    imageOptions: {
      margin: 10,
      imageSize: 0.6
    }
  })

  if (qrContainer.value) {
    qr.append(qrContainer.value)
  }
})

watch(
  () => props.url,
  (newUrl) => {
    qr.update({ data: newUrl })
  }
)
</script>
<template>
  <div ref="qrContainer"></div>
</template>

<style scoped></style>
