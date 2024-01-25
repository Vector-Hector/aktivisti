<script setup lang="ts">
import { ionChevronBack } from '@quasar/extras/ionicons-v5'
import { QBtn } from 'quasar'

interface Emits {
  (e: 'back'): void
}
const emit = defineEmits<Emits>()
</script>

<template>
  <div class="sidebar-bottom-navigation row">
    <div class="col right">
      <QBtn
        class="button"
        outline
        dense
        color="primary"
        style="background: white !important"
        label="Zurück"
        :icon="ionChevronBack"
        @click="emit('back')"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.sidebar-bottom-navigation {
  background: $grey-3;
  padding: 0.5rem;
  align-items: normal;

  .button {
    padding-right: 0.7rem;
  }
}

.right {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;

  .button {
    padding-left: 0.7rem;
  }
}
</style>
