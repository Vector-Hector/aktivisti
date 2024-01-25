<script setup lang="ts">
import { ref } from 'vue'
import EventInvitePeople from 'src/components/EventInvitePeople.vue'
import { QCard, QCardSection, QDialog, QToolbar, QToolbarTitle } from 'quasar'

interface Props {
  eventId: number
}
const props = defineProps<Props>()

interface Emits {
  // REQUIRED
  (e: 'ok'): void
  (e: 'hide'): void
}
const emit = defineEmits<Emits>()

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
    <QCard class="invite-modal">
      <QToolbar>
        <QToolbarTitle>Leute einladen</QToolbarTitle>
      </QToolbar>
      <QCardSection>
        <EventInvitePeople :event-id="props.eventId" />
      </QCardSection>
    </QCard>
  </QDialog>
</template>

<style lang="scss" scoped>
.invite-modal {
  min-width: 320px;
}
</style>
