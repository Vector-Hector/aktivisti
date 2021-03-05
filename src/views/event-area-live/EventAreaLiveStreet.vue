<template>
  <IonList>
    <IonItem
      v-for="address in eventArea.area_details.streets.find(({name}) => name === street).addresses"
      :key="address.house_number"
      :button="true"
      @click="$router.push({ name: 'event-area-live-metrics', params: { houseNumber: address.house_number, street: street } })"
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
import { defineComponent, PropType } from 'vue'
import { IonIcon, IonItem, IonLabel, IonList } from '@ionic/vue'
import { EventAreaDto } from '@/api/model/EventAreaDto'


export default defineComponent({
  name: 'EventAreaLiveStreet',
  components: {
    IonList,
    IonItem,
    IonLabel,
    IonIcon
  },
  props: {
    eventArea: {
      type: Object as PropType<EventAreaDto>,
      required: true
    },
    street: {
      type: String as PropType<string>,
      required: true
    }
  },
  data() {
    return {}
  },
  created() {
  },
  methods: {}
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
