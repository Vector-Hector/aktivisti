<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>Leute einladen</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
    <EventInvitePeople :event-id="eventId" />
  </ion-content>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { IonContent, IonHeader, IonToolbar } from '@ionic/vue'
import EventInvitePeople from '@/components/EventInvitePeople.vue'

export default defineComponent({
  name: 'EventInvitePeopleModal',
  components: {
    IonContent,
    IonToolbar,
    IonHeader,
    EventInvitePeople,
  },
  props: {
    eventId: {
      type: Number as PropType<number>,
      required: true
    }
  }
})
</script>

<style lang="scss" scoped>

</style>
