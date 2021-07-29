<template>
  <QDialog ref="dialog" @hide="onDialogHide">
    <QCard class="participants-modal">
      <QToolbar>
        <QToolbarTitle>Mitmachende</QToolbarTitle>
      </QToolbar>
      <QCardSection>
        <EventParticipantsList :event-id="eventId" :event-sub-association="eventSubAssociation"/>
      </QCardSection>
    </QCard>
  </QDialog>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { QCard, QCardSection, QDialog, QToolbar, QToolbarTitle } from 'quasar'
import EventParticipantsList from 'src/components/EventParticipantsList.vue'

export default defineComponent({
  name: 'EventParticipantsModal',
  components: {
    EventParticipantsList,
    QDialog,
    QCard,
    QCardSection,
    QToolbar,
    QToolbarTitle,
  },
  emits: [
    // REQUIRED
    'ok', 'hide'
  ],
  props: {
    eventId: {
      type: Number as PropType<number>,
      required: true
    },
    eventSubAssociation: {
      type: Number as PropType<number>,
      required: false
    }
  },
  methods: {
    show() {
      // @ts-ignore
      this.$refs.dialog.show()
    },
    hide() {
      // @ts-ignore
      this.$refs.dialog.hide()
    },
    onDialogHide() {
      this.$emit('hide')
    }
  }
})
</script>

<style lang="scss" scoped>
.participants-modal {
  min-width: 320px;
}
</style>
