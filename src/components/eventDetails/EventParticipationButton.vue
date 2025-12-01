<script setup lang="ts">
import { ionPeopleSharp } from '@quasar/extras/ionicons-v5'
import { useQuasar } from 'quasar'
import LabeledBtn from 'components/LabeledBtn.vue'
import EventParticipantsModal from 'src/components/modals/EventParticipantsModal.vue'

interface Props {
  eventId: number
  eventSubAssociation: number
  hasNotification?: boolean
}
interface Emits {
  (e: 'onDissmiss'): void
}
const props = withDefaults(defineProps<Props>(), {
  hasNotification: false
})
const emit = defineEmits<Emits>()

const $q = useQuasar()

function openParticipantsModal() {
  $q.dialog({
    component: EventParticipantsModal,
    maximized: true,
    componentProps: {
      eventId: props.eventId,
      eventSubAssociation: props.eventSubAssociation
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
    :icon="ionPeopleSharp"
    @click="openParticipantsModal"
    :external-label="$t('events.details.participants')"
    :has-notification="props.hasNotification"
  />
</template>
