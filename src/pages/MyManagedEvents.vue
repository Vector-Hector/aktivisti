<template>
  <QPage class="flex-fill">
    <div class="container my-managed-events">
      <ManagedEvents/>
    </div>
  </QPage>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { QPage } from 'quasar'
import ManagedEvents from 'components/ManagedEvents.vue'


export default defineComponent({
  name: 'MyManagedEvents',
  components: {
    ManagedEvents,
    QPage,
  },
})
</script>

<style lang="scss" scoped>
@import "src/css/variables.scss";

.my-managed-events {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>

