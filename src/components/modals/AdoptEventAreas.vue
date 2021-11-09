<template>
  <QDialog
    ref="dialog"
    :full-width="$q.screen.lt.md"
    :full-height="$q.screen.lt.md"
  >
    <QCard class="adopt-events-modal">
      <QToolbar>
        <QToolbarTitle>Gebiete aus anderer Aktion übernehmen</QToolbarTitle>
      </QToolbar>
      <QCardSection class="description-section">
      <span class="description">
          Bitte wähle eine Aktion aus, von welcher du die definierten Gebiete übernehmen möchtest.
      </span>
      </QCardSection>
      <QCardSection class="section">
        <ManagedEvents @clickOnEvent="handleClickOnEvent" />
      </QCardSection>
    </QCard>
  </QDialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { QCard, QDialog, QToolbar, QCardSection, QToolbarTitle } from 'quasar'
import ManagedEvents from 'components/ManagedEvents.vue'
import { EventDto } from 'src/api/model/EventDto'
import { apiClient } from 'src/api/ApiClient'
import EditEventMixin from 'pages/edit-event/EditEventMixin'
import hat from 'hat'

export default defineComponent({
  name: 'AdoptEventAreas',
  mixins: [EditEventMixin],
  components: {
    ManagedEvents,
    QDialog,
    QCard,
    QCardSection,
    QToolbar,
    QToolbarTitle
  },
  emits: [
    // REQUIRED
    'ok', 'hide'
  ],
  methods: {
    show() {
      // @ts-ignore
      this.$refs.dialog.show()
    },

    // following method is REQUIRED
    // (don't change its name --> "hide")
    hide() {
      // @ts-ignore
      this.$refs.dialog.hide()
    },

    onDialogHide() {
      // required to be emitted
      // when QDialog emits "hide" event
      this.$emit('hide')
    },

    onOKClick() {
      // on OK, it is REQUIRED to
      // emit "ok" event (with optional payload)
      // before hiding the QDialog
      this.$emit('ok')
      // or with payload: this.$emit('ok', { ... })

      // then hiding dialog
      this.hide()
    },
    async handleClickOnEvent(event: EventDto) {
      const response = await apiClient.eventAreas.list({event: event.id.toString()})
      const eventAreas = response.payload.data
      const cleanedEventAreas = eventAreas.map((area) => ({
        name: area.name,
        feature_id: hat(),
        color: area.color,
        geometry: area.geometry
      }))
      this.hide()
      this.$emit('ok', cleanedEventAreas)
    }
  }
})
</script>

<style lang="scss" scoped>
.section {
  display: flex;
  flex-direction: column;
  // TODO(peter): Find a better solution
  //  This seams to be kind of a bug of quasar see https://github.com/quasarframework/quasar/issues/5926
  //  The scroll area is not displayed the right way in combination with QDialog
  height: 0;
  flex-grow: 1;
}

.adopt-events-modal {
  min-width: 320px;
  min-height: 800px;
  display: flex;
  flex-direction: column;
}

.description {
  color: $grey-6;
  font-size: 0.75rem;
  line-height: 1;
  display: block;
}

.description-section {
  padding-bottom: 0;
}
</style>
