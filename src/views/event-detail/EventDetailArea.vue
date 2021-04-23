<template>
  <router-view
    v-slot="{Component}"
    :event-area="eventArea"
    :event="event"
  >
    <keep-alive>
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { IonCol, IonContent, IonGrid, IonRow } from '@ionic/vue'
import Map from '@/lib/mapbox/Map.vue'
import FeatureLayer from '@/lib/mapbox/AreaFeatureLayer.vue'

import EventAreaMixin from '@/views/event-detail/EventDetailAreaMixin'


export default defineComponent({
  name: 'EventDetailArea',
  components: {
    FeatureLayer,
    Map,
    IonContent,
    IonGrid,
    IonRow,
    IonCol
  },
  mixins: [EventAreaMixin]
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

.event-area-title {
  margin: 0.8rem 0 0 0;
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

</style>
