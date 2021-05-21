<template>
  <IonHeader>
    <IonToolbar>
      <ion-title>QR-Link zu Linksaktiv</ion-title>
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
    <div class="qr-container">
      <img
        src="../../assets/img/create-lead-qr.png"
        alt="QR Code mit Link zu Linksaktiv"
      >
    </div>
  </IonContent>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import {
  IonButton,
  IonButtons,
  IonContent, IonHeader,
  IonIcon, IonToolbar,
  modalController
} from '@ionic/vue'

export default defineComponent({
  name: 'CreateLeadQR',
  components: {
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonHeader,
    IonToolbar
  },
  methods: {
    dismiss() {
      modalController.dismiss(false)
    },
    confirm() {
      modalController.dismiss(true)
    }
  }
})
</script>
<style lang="scss" scoped>
.qr-container {
  width: 100%;
  height: 100%;
  img {
    width: 100%;
  }
}
</style>
