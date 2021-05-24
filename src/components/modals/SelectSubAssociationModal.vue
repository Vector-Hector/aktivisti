<template>
  <IonHeader>
    <IonToolbar>
      <IonTitle>Kreis/Bezirksverband auswählen</IonTitle>
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
    <IonSearchbar
      placeholder="Verbände filtern"
      @ionChange="filterTerm = $event.target.value"
    />
    <IonList>
      <IonItem
        v-for="item in filteredAssociations"
        :key="item.id"
      >
        <IonLabel>{{ item.name }}</IonLabel>
        <IonCheckbox
          slot="start"
          :checked="selected.includes(item.id)"
          :value="item.id"
          @ionChange="optionSelected"
        />
      </IonItem>
    </IonList>
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
  IonSearchbar,
  IonItem,
  IonCheckbox,
  IonList,
  modalController, IonLabel
} from '@ionic/vue'
import { addIcons } from 'ionicons'
import { close } from 'ionicons/icons'
import { SubAssociationDto } from 'src/api/model/SubAssociationDto'

addIcons({
  close
})

export default defineComponent({
  name: 'SelectSubAssociationModal',

  components: {
    IonContent,
    IonToolbar,
    IonHeader,
    IonButton,
    IonButtons,
    IonIcon,
    IonTitle,
    IonSearchbar,
    IonItem,
    IonCheckbox,
    IonList,
    IonLabel
  },
  props: {
    initiallySelected: {
      type: Array as PropType<number[]>,
      default: () => []
    },
    subAssociations: {
      type: Array as PropType<SubAssociationDto[]>,
      required: true
    }
  },
  data() {
    return {
      selected: this.initiallySelected,
      filterTerm: ''
    }
  },
  computed: {
    selectedAssociations(): SubAssociationDto[] {
      return [...this.subAssociations
        .filter(item => this.selected.includes(item.id))]
        .sort((a, b) => a.name > b.name ? 1 : -1)
    },
    filteredAssociations(): SubAssociationDto[] {
      return [...this.selectedAssociations, ...[...this.subAssociations]
        .filter((item) =>
          item.name.toLowerCase().includes(this.filterTerm.toLowerCase()) && !this.selected.includes(item.id)
        )
        .sort((a, b) => a.name > b.name ? 1 : -1)]
    }
  },
  methods: {
    dismiss() {
      void modalController.dismiss(this.selected)
    },
    optionSelected(event: any) {
      const id = parseInt(event.detail.value)
      if (event.detail.checked) {
        this.selected = [...this.selected, id]
      } else {
        this.selected = this.selected.filter(item => item !== id)
      }
    }
  }
})
</script>

<style lang="scss" scoped>

</style>
