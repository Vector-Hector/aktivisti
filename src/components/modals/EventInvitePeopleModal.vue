<script lang="ts">
import { defineComponent, PropType } from 'vue'
import EventInvitePeople from 'src/components/EventInvitePeople.vue'
import { QCard, QCardSection, QDialog, QToolbar, QToolbarTitle } from 'quasar'

export default defineComponent({
  name: 'EventInvitePeopleModal',
  components: {
    QDialog,
    QCard,
    QCardSection,
    QToolbar,
    QToolbarTitle,
    EventInvitePeople
  },
  emits: [
    // REQUIRED
    'ok',
    'hide'
  ],
  props: {
    eventId: {
      type: Number as PropType<number>,
      required: true
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

<template>
  <QDialog ref="dialog" @hide="onDialogHide">
    <QCard class="invite-modal">
      <QToolbar>
        <QToolbarTitle>Leute einladen</QToolbarTitle>
      </QToolbar>
      <QCardSection>
        <EventInvitePeople :event-id="eventId" />
      </QCardSection>
    </QCard>
  </QDialog>
</template>

<style lang="scss" scoped>
.invite-modal {
  min-width: 320px;
}
</style>
