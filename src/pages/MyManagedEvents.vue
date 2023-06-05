<template>
  <QPage class="flex-fill">
    <div class="container my-managed-events">
      <ManagedEvents @clickOnEvent="goToEvent" />
    </div>
  </QPage>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { QPage } from 'quasar'
import ManagedEvents from 'components/ManagedEvents.vue'
import { EventDto } from 'src/api/model/EventDto'

export default defineComponent({
  name: 'MyManagedEvents',
  components: {
    ManagedEvents,
    QPage
  },
  methods: {
    goToEvent(event: EventDto) {
      void this.$router.push({
        name: 'event-detail',
        params: {
          eventId: event.id
        }
      })
    }
  }
})
</script>

<style lang="scss" scoped>
@import 'src/css/variables.scss';

.my-managed-events {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
