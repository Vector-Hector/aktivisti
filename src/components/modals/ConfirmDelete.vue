<template>

    <div class="modal-content">
      <IonText color="dark">
        <h3 class="modal-title">
          {{ event.name }} wirklich löschen?
        </h3>
      </IonText>
      <IonText
        color="danger"
        class="modal-description"
      >
        Das Event <b>"{{ event.name }}"</b> wird gelöscht und kann nicht wiederhergestellt werden.
      </IonText>
      <IonButtons class="modal-buttons">
        <IonButton
          color="light"
          fill="solid"
          @click="dismiss()"
        >
          Abbrechen
        </IonButton>
        <IonButton
          color="danger"
          fill="solid"
          @click="confirm()"
        >
          Bestätigen
        </IonButton>
      </IonButtons>
    </div>

</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { EventDto } from 'src/api/model/EventDto'
import {
  IonButton,
  IonButtons,

  IonText,
  modalController
} from '@ionic/vue'

export default defineComponent({
  name: 'ConfirmDelete',
  components: {

    IonButtons,
    IonButton,
    IonText
  },
  props: {
    event: {
      type: Object as PropType<EventDto>,
      required: true
    }
  },
  methods: {
    async dismiss() {
      await modalController.dismiss(false)
    },
    async confirm() {
      await modalController.dismiss(true)
    }
  }
})
</script>
<style lang="scss" scoped>
.modal-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  height: 100%
}

.modal-description {
  flex: 1;
}

.modal-buttons {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
}
</style>
