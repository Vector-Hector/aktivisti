<script setup lang="ts">
import {
  ionCheckmark,
  ionChevronBack,
  ionChevronForward
} from '@quasar/extras/ionicons-v5'
import { QBtn } from 'quasar'

interface Props {
  last?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  last: () => false
})

interface Emits {
  (e: 'forward'): void
  (e: 'back'): void
}
const emit = defineEmits<Emits>()
</script>
<template>
  <div class="sidebar-bottom-navigation row">
    <div class="col left">
      <QBtn
        class="button"
        outline
        dense
        color="primary"
        label="Zurück"
        :icon="ionChevronBack"
        @click="emit('back')"
      />
    </div>
    <div class="col right">
      <QBtn
        class="button"
        dense
        color="primary"
        :label="props.last ? 'Fertig' : 'Weiter'"
        :icon-right="props.last ? ionCheckmark : ionChevronForward"
        @click="emit('forward')"
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
