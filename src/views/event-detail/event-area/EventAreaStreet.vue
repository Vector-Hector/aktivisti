<template>
  <IonList>
    <IonItem
      v-for="address in sortedAddresses"
      :key="address.house_number"
      :button="true"
      @click="$router.push({ name: 'event-detail-area-metrics', params: { houseNumber: address.house_number, street: street } })"
    >
      <IonLabel>
        <h3>{{ street }} {{ address.house_number }}</h3>
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
import { AddressDetails } from '@/api/model/AreaDetailsDto'
import EventAreaStreetMixin from '@/views/event-detail/event-area/EventAreaStreetMixin'
import EventAreaMixin from '@/views/event-detail/event-area/EventAreaMixin'


export default defineComponent({
  name: 'EventAreaStreet',
  components: {
    IonList,
    IonItem,
    IonLabel,
    IonIcon
  },
  mixins: [EventAreaStreetMixin, EventAreaMixin],
  computed: {
    sortedAddresses(): AddressDetails[] {
      const collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
      return this.eventArea.area_details?.streets.find(({name}) => name === this.street)?.addresses?.sort((a, b) => {
        return collator.compare(a.house_number, b.house_number)
      }) ?? []
    }
  }
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
