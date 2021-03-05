<template>
  <IonList>
    <IonItem
      v-for="street in eventArea.area_details.streets"
      :key="street.name"
      :button="true"
      @click="$router.push({ name: 'event-area-live-street', params: { street: street.name } })"
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
import { defineComponent, PropType } from 'vue'
import { IonIcon, IonItem, IonLabel, IonList } from '@ionic/vue'
import { EventAreaDto } from '@/api/model/EventAreaDto'


export default defineComponent({
  name: 'EventAreaLiveOverview',
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
    }
  },
  data() {
    return {
      progress: 0
    }
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
