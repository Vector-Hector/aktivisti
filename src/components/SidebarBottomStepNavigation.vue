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
        @click="$emit('back')"
      />
    </div>
    <div class="col middle">
      <QBtn
        class="button"
        flat
        dense
        color="primary"
        label="Schließen"
        @click="$emit('close')"
      />
    </div>
    <div class="col right">
      <QBtn
        class="button"
        dense
        color="primary"
        :label="last ? 'Fertig' : 'Weiter'"
        :icon-right="last ? ionCheckmark : ionChevronForward"
        @click="$emit('forward')"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue'
import {
  ionCheckmark,
  ionChevronBack,
  ionChevronForward
} from '@quasar/extras/ionicons-v5'
import { QBtn } from 'quasar'

export default defineComponent({
  name: 'SidebarBottomStepNavigation',
  components: {
    QBtn
  },
  props: {
    last: {
      type: Boolean as PropType<boolean>,
      default: false
    }
  },
  emits: ['forward', 'back', 'close'],
  data() {
    return {
      ionChevronBack,
      ionChevronForward,
      ionCheckmark
    }
  }
})
</script>
<style lang="scss" scoped>
.sidebar-bottom-navigation {
  background: $grey-3;
  padding: 0.5rem;
  align-items: normal;

  .button {
    padding-right: 0.7rem;
  }
}

.middle {
  display: flex;
  flex-direction: row;
  justify-content: center;
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
