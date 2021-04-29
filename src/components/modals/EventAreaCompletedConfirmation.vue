<template>
  <IonHeader>
    <IonToolbar>
      <IonTitle v-if="willComplete">
        Aktionsgebiet erledigt
      </IonTitle>
      <IonTitle v-if="!willComplete">
        Aktionsgebiet nicht erledigt
      </IonTitle>
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
    <p v-if="willComplete">
      Das Aktionsgebiet {{ eventArea.name }} als erledigt markieren?
    </p>
    <p v-if="!willComplete">
      Das Aktionsgebiet {{ eventArea.name }} als nicht erledigt markieren?
    </p>
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
import { addIcons } from 'ionicons'
import { close } from 'ionicons/icons'

addIcons({
  close
})

export default defineComponent({
  name: 'EventAreaCompletedConfirmation',
  components: {
    IonContent,
    IonToolbar,
    IonHeader,
    IonButton,
    IonButtons,
    IonIcon,
    IonTitle
  },
  props: {
    eventArea: {
      type: Number as PropType<number>,
      required: true
    },
    willComplete: {
      type: Boolean as PropType<boolean>,
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
