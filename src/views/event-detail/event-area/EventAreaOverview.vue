<template>
  <IonList>
    <IonItem
      v-for="street in eventArea.area_details.streets"
      :key="street.name"
      :button="true"
      @click="$router.push({ name: 'event-detail-area-street', params: { street: street.name } })"
    >
      <IonLabel>
        <h3>{{ street.name }}</h3>
        <p>{{ street.addresses.length }} Adressen</p>
      </IonLabel>
      <IonIcon
        slot="end"
        class="chevron"
        name="chevron-forward"
      />
    </IonItem>
  </IonList>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { IonIcon, IonItem, IonLabel, IonList } from '@ionic/vue'
import EventAreaMixin from '@/views/event-detail/event-area/EventAreaMixin'


export default defineComponent({
  name: 'EventAreaOverview',
  components: {
    IonList,
    IonItem,
    IonLabel,
    IonIcon
  },
  mixins: [EventAreaMixin],
})

</script>

<style lang="scss" scoped>
@import "~@/scss/_globals.scss";

label {
  text-align: left;
}

.campaign {
  font-weight: bold;
  display: block;
}

.map {
  min-height: 180px;
  margin-bottom: 1.5em;
}

.button-group {
  margin-top: 1.5em;
}

.event-name {
  font-weight: bold;
  font-size: 1rem;
}

.full-width {
  width: 100%;
}

</style>
