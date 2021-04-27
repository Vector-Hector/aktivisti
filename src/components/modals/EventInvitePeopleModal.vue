<template>
  <IonHeader>
    <IonToolbar>
      <ion-title>Leute einladen</ion-title>
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
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonToolbar, modalController } from '@ionic/vue'
import EventInvitePeople from '@/components/EventInvitePeople.vue'
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
      modalController.dismiss()
    }
  }
})
</script>

<style lang="scss" scoped>

</style>
