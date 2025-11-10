<script setup lang="ts">
import { ionQrCodeOutline } from '@quasar/extras/ionicons-v5'
import { useQuasar } from 'quasar'
import LabeledBtn from 'components/LabeledBtn.vue'
import EventQrCodeModal from '../modals/EventQrCodeModal.vue'

interface Props {
  url: string
  name: string
}

interface Emits {
  (e: 'onDissmiss'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const $q = useQuasar()

function openQrCodeModal() {
  $q.dialog({
    component: EventQrCodeModal,
    maximized: true,
    componentProps: {
      url: props.url,
      name: props.name
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
    :icon="ionQrCodeOutline"
    @click="openQrCodeModal"
    :external-label="$t('events.details.actions.qrCode.label')"
  />
</template>
