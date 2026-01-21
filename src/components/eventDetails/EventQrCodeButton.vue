<script setup lang="ts">
import { ionQrCodeOutline } from '@quasar/extras/ionicons-v5'
import { useQuasar } from 'quasar'
import LabeledBtn from 'components/LabeledBtn.vue'
import EventQrCodeModal from '../modals/EventQrCodeModal.vue'
import { QrCodeImage } from '../QrCode.vue'

interface Props {
  url: string
  name?: string
  small?: boolean
  label?: false | string
  explanation?: string
  showUrl?: boolean
  image?: QrCodeImage
}

interface Emits {
  (e: 'onDissmiss'): void
}

const props = withDefaults(defineProps<Props>(), {
  small: false,
  label: false,
  showUrl: true,
  image: 'normal'
})
const emit = defineEmits<Emits>()

const $q = useQuasar()

function openQrCodeModal() {
  $q.dialog({
    component: EventQrCodeModal,
    maximized: true,
    componentProps: {
      url: props.url,
      name: props.name ?? '',
      explanation: props.explanation ?? '',
      showUrl: props.showUrl,
      image: props.image
    }
  }).onDismiss(() => {
    emit('onDissmiss')
  })
}
</script>
<template>
  <LabeledBtn
    round
    outline
    :dense="small"
    :icon="ionQrCodeOutline"
    @click="openQrCodeModal"
    :external-label="label ? label : ''"
  />
</template>
