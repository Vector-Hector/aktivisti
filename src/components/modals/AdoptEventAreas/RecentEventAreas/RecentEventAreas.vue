<script setup lang="ts">
import { EventDto } from 'src/api/model/EventDto'
import { QCardSection, QBtn } from 'quasar'
import { useEditEventMixin } from 'pages/edit-event/EditEventMixin'
import SelectEvent from '../SelectEvent.vue'

interface Emits {
  (e: 'onEventClick', event: EventDto): void
  (e: 'onBackClick'): void
  (e: 'onAbortClick'): void
}

const emit = defineEmits<Emits>()

function handleClickOnEvent(event: EventDto) {
  emit('onEventClick', event)
}
function handleBackClick(): void {
  emit('onBackClick')
}
function handleAbortClick(): void {
  emit('onAbortClick')
}

function excludeCurrentEvent(event: EventDto) {
  const { event: currentEvent } = useEditEventMixin()
  return event.id !== currentEvent.value.id
}
</script>
<template>
  <QCardSection class="description-section">
    <span class="description">
      {{ $t('adoptEventAreas.recentEventAreas.description') }}
    </span>
  </QCardSection>
  <QCardSection class="section">
    <SelectEvent
      @clickOnEvent="handleClickOnEvent"
      :filter="excludeCurrentEvent"
    />
  </QCardSection>
  <QCardSection>
    <QCardActions>
      <QBtn
        color="primary"
        outline
        dense
        :label="$t('general.back')"
        @click="handleBackClick"
      />
      <QBtn
        color="primary"
        outline
        dense
        :label="$t('general.cancel')"
        @click="handleAbortClick"
      />
    </QCardActions>
  </QCardSection>
</template>

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

.description {
  color: $grey-6;
  font-size: 0.75rem;
  line-height: 1;
  display: block;
}

.description-section {
  padding-bottom: 0;
}

.q-card__section {
  qcardactions {
    button:not(:first-child) {
      margin-left: 8px;
    }
  }
}
</style>
