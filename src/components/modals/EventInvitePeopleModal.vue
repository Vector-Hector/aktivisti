<template>
  <IonHeader>
    <IonToolbar>
      <IonTitle>Leute einladen</IonTitle>
      <IonButtons slot="end">
        <IonButton @click="dismiss">
          <IonIcon
            name="close"
          />
        </IonButton>
      </IonButtons>
    </IonToolbar>
  </IonHeader>
  <IonContent class="ion-padding">
    <EventInvitePeople :event-id="eventId" />
  </IonContent>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
  modalController
} from '@ionic/vue'
import EventInvitePeople from 'src/components/EventInvitePeople.vue'
import { addIcons } from 'ionicons'
import { close } from 'ionicons/icons'

addIcons({
  close
})

export default defineComponent({
  name: 'EventInvitePeopleModal',
  components: {
    IonContent,
    IonToolbar,
    IonHeader,
    IonButton,
    IonButtons,
    IonIcon,
    IonTitle,
    EventInvitePeople
  },
  props: {
    eventId: {
      type: Number as PropType<number>,
      required: true
    }
  },
  methods: {
    dismiss() {
      void modalController.dismiss()
    }
  }
})
</script>

<style lang="scss" scoped>

</style>
