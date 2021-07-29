<template>
  <div class="sidebar-bottom-navigation row">
    <div class="col right">
      <QBtn
        class="button"
        outline
        dense
        color="primary"
        style="background: white !important;"
        label="Zurück"
        :icon="ionChevronBack"
        @click="$emit('back')"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { ionCheckmark, ionChevronBack, ionChevronForward } from '@quasar/extras/ionicons-v5'
import { QBtn } from 'quasar'

export default defineComponent({
  name: 'SidebarBottomBackNavigation',
  components: {
    QBtn
  },
  emits: ['back'],
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

.right {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;

  .button {
    padding-left: 0.7rem;
  }
}
</style>
