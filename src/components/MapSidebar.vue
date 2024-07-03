<script setup lang="ts">
import { farCalendarPlus } from '@quasar/extras/fontawesome-v5'
import { QBtn } from 'quasar'

interface Props {
  showCreateButton: boolean
}

interface Emits {
  (e: 'onCreateEvent'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

function handleCreateEvent() {
  emit('onCreateEvent')
}
</script>
<template>
  <div class="map-sidebar">
    <QBtn
      label="Aktion erstellen"
      class="create-button"
      color="primary"
      v-if="props.showCreateButton"
      :icon="farCalendarPlus"
      @click="handleCreateEvent"
    />
    <div class="map-sidebar-content">
      <div class="overlay-content">
        <slot />
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.map-sidebar {
  min-width: 450px;
  width: 25vw;
  order: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
}

.map-sidebar-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.create-button {
  margin: 1rem 10px 0 10px;
}

.overlay-content {
  height: 100%;
  display: flex;
}

.overlay-title {
  background: $grey-1;
  border-bottom: 1px solid $red;
  margin: 0;
  padding: 0.5rem 1rem;
  font-size: 1.5rem;
  line-height: 1.5rem;
}
</style>
