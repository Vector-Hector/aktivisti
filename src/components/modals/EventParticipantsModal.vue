<script setup lang="ts">
import { ref } from 'vue'
import { QCard, QCardSection, QDialog, QToolbar, QToolbarTitle } from 'quasar'
import EventParticipantsList from 'src/components/EventParticipantsList.vue'

interface Emits {
  // REQUIRED
  (e: 'ok'): void
  (e: 'hide'): void
}
const emit = defineEmits<Emits>()

interface Props {
  eventId: number
  eventSubAssociation?: number
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
      <QToolbar>
        <QToolbarTitle>{{ $t('eventParticipantsModal.title') }}</QToolbarTitle>
      </QToolbar>
      <QCardSection>
        <EventParticipantsList
          :event-id="props.eventId"
          :event-sub-association="props.eventSubAssociation"
        />
      </QCardSection>
    </QCard>
  </QDialog>
</template>

<style lang="scss" scoped>
.participants-modal {
  min-width: 320px;
}
</style>
